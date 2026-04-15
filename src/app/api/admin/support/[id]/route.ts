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

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true, role: true } },
        messages: { orderBy: { createdAt: "asc" } }
      }
    })

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch ticket" }, { status: 500 })
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

    const { status, resolution } = await req.json()

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : undefined,
        resolvedBy: status === "RESOLVED" ? session.user.id : undefined,
        adminResponse: resolution
      }
    })

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ success: false, error: "Failed to update ticket" }, { status: 500 })
  }
}
