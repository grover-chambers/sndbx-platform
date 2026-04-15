import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, type, capacity, description, hourlyRate, dailyRate, isActive } = body

    const space = await prisma.space.update({
      where: { id: params.id },
      data: {
        name,
        type,
        capacity,
        description,
        hourlyRate,
        dailyRate,
        isActive
      }
    })

    return NextResponse.json({ success: true, space })
  } catch (error) {
    console.error("Error updating space:", error)
    return NextResponse.json({ error: "Failed to update space" }, { status: 500 })
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

    // Check if space has any bookings
    const bookings = await prisma.booking.count({
      where: { spaceId: params.id }
    })

    if (bookings > 0) {
      // Soft delete - just deactivate instead of deleting
      await prisma.space.update({
        where: { id: params.id },
        data: { isActive: false }
      })
    } else {
      await prisma.space.delete({
        where: { id: params.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting space:", error)
    return NextResponse.json({ error: "Failed to delete space" }, { status: 500 })
  }
}
