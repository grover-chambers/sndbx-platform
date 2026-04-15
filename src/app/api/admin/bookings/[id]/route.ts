import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: { 
          include: { 
            user: { select: { id: true, name: true, email: true } } 
          } 
        },
        space: { 
          select: { 
            id: true, 
            name: true, 
            type: true, 
            capacity: true, 
            hourlyRate: true, 
            dailyRate: true,
            description: true 
          } 
        },
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, notes } = await req.json()

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        client: { include: { user: true } },
        space: true
      }
    })

    // Create notification for client
    if (status === "CONFIRMED") {
      await prisma.notification.create({
        data: {
          userId: booking.client.userId,
          title: "Booking Confirmed",
          message: `Your booking for ${booking.space.name} on ${new Date(booking.startTime).toLocaleString()} has been confirmed.`,
          type: "BOOKING_CONFIRMATION",
        }
      })
    } else if (status === "CANCELLED") {
      await prisma.notification.create({
        data: {
          userId: booking.client.userId,
          title: "Booking Cancelled",
          message: `Your booking for ${booking.space.name} on ${new Date(booking.startTime).toLocaleString()} has been cancelled.`,
          type: "BOOKING_CANCELLED",
        }
      })
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.booking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting booking:", error)
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 })
  }
}
