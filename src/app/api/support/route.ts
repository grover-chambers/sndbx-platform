import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, issueType } = await req.json()
    
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}`

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        title,
        description,
        issueType,
        priority: "MEDIUM",
        status: "OPEN",
        userId: session.user.id
      }
    })

    // Notify admins (create notification)
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } }
    })
    
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: "New Support Ticket",
          message: `New ticket #${ticketNumber} from ${session.user.name || session.user.email}`,
          type: "SUPPORT_TICKET",
        }))
      })
    }

    return NextResponse.json({ success: true, ticket })
  } catch (error) {
    console.error("Error creating ticket:", error)
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 })
  }
}
