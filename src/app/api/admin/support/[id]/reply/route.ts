import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await req.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        content: message,
        isFromAdmin: true,
        ticketId: params.id
      }
    })

    // Update ticket status to in_progress if it was open
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: "IN_PROGRESS" }
    })

    return NextResponse.json({ success: true, message: supportMessage })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json({ success: false, error: "Failed to send reply" }, { status: 500 })
  }
}
