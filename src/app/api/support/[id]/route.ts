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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Check if user owns this ticket
    if (ticket.userId !== session.user.id && session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}
