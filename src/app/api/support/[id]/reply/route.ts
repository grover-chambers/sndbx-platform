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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await req.json()

    const supportMessage = await prisma.supportMessage.create({
      data: {
        content: message,
        isFromAdmin: false,
        ticketId: params.id
      }
    })

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } }
    })
    
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: "New Support Reply",
          message: `New reply on ticket #${params.id}`,
          type: "SUPPORT_REPLY",
        }))
      })
    }

    return NextResponse.json({ success: true, message: supportMessage })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
  }
}
