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

    console.log("Fetching user with ID:", params.id)

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        company: { 
          select: { 
            id: true, 
            name: true, 
            status: true, 
            fieldOfExpertise: true 
          } 
        },
        clientProfile: { 
          select: { 
            id: true, 
            companyName: true, 
            industry: true, 
            size: true 
          } 
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Found user:", user.email)

    // Get engagements (using startedAt instead of createdAt)
    const engagements = await prisma.engagement.findMany({
      where: {
        OR: [
          { client: { userId: user.id } },
          { company: { users: { some: { id: user.id } } } }
        ]
      },
      include: { 
        client: { select: { companyName: true } },
        company: { select: { name: true } } 
      },
      orderBy: { startedAt: "desc" }
    })

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: { client: { userId: user.id } },
      include: { space: { select: { name: true } } },
      orderBy: { startTime: "desc" }
    })

    // Calculate metrics
    const totalEngagements = engagements.length
    const completedEngagements = engagements.filter(e => e.stage === "COMPLETED").length
    const completionRate = totalEngagements > 0 ? Math.round((completedEngagements / totalEngagements) * 100) : 0
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)

    return NextResponse.json({ 
      user: { 
        ...user, 
        engagements,
        bookings,
        metrics: {
          totalEngagements,
          completedEngagements,
          completionRate,
          totalSpent,
          totalBookings: bookings.length
        }
      } 
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
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

    const { name, email, role } = await req.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        role: role !== undefined ? role : undefined
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: status === "active" ? "active" : "suspended" }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
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

    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
