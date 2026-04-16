import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { spaceId, startTime, endTime, notes } = body

    // Get client profile
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id }
    })

    if (!client) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 400 })
    }

    // Get space details
    const space = await prisma.space.findUnique({
      where: { id: spaceId }
    })

    if (!space) {
      return NextResponse.json({ error: "Space not found" }, { status: 404 })
    }

    // Check for conflicts
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        spaceId,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 400 }
      )
    }

    // Calculate duration and amount
    const start = new Date(startTime)
    const end = new Date(endTime)
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)))
    const totalAmount = (space.hourlyRate || 50) * hours

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        spaceId,
        clientId: client.id,
        createdById: session.user.id,
        startTime: start,
        endTime: end,
        totalAmount,
        notes: notes || null,
        status: "PENDING"
      },
      include: {
        space: true,
        client: {
          include: { user: true }
        }
      }
    })

    // Create invoice for the booking
    const invoiceNumber = `INV-${Date.now()}`
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7) // Due in 7 days

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        amount: totalAmount,
        status: "SENT",
        dueDate,
        clientId: client.id,
        bookingId: booking.id,
        userId: session.user.id
      }
    })

    // Notify admin about pending booking
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } }
    })
    
    await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: "New Booking Request",
        message: `New booking request for ${space.name} from ${client.companyName}`,
        type: "BOOKING_REQUEST",
      }))
    })

    // Notify client
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: "Booking Request Submitted",
        message: `Your booking request for ${space.name} has been submitted. Please wait for confirmation.`,
        type: "BOOKING_SUBMITTED",
      }
    })

    return NextResponse.json({ 
      success: true, 
      booking, 
      invoice,
      message: "Booking request submitted. An invoice has been generated."
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let bookings: any[] = []

    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
      bookings = await prisma.booking.findMany({
        include: {
          space: true,
          client: {
            include: { user: { select: { name: true, email: true } } }
          },
          invoice: true
        },
        orderBy: { startTime: "desc" }
      })
    } else {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id }
      })
      
      if (client) {
        bookings = await prisma.booking.findMany({
          where: { clientId: client.id },
          include: {
            space: true,
            invoice: true
          },
          orderBy: { startTime: "desc" }
        })
      }
    }

    return NextResponse.json({ success: true, bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
