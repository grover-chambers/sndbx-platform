import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ success: true, messages: [] })
    }

    // For now, return mock messages
    // In production, this would query a Message table
    const mockMessages = [
      {
        id: "1",
        senderName: "John Mwangi",
        senderCompany: "TechCorp Kenya",
        content: "Hi, I'm interested in your web development services. Do you have time for a call this week?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: false
      },
      {
        id: "2",
        senderName: "Sarah Wanjiku",
        senderCompany: "Creative Agency",
        content: "Thanks for the proposal! I'll review it and get back to you.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: true
      },
      {
        id: "3",
        senderName: "Michael Otieno",
        senderCompany: "FinTech Solutions",
        content: "Can we schedule a meeting to discuss the project scope?",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        isRead: true
      }
    ]

    return NextResponse.json({ success: true, messages: mockMessages })
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
