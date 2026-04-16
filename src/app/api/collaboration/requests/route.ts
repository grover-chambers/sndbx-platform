import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const sentRequests = await prisma.collaborationRequest.findMany({
      where: { senderId: user.company.id },
      include: {
        receiver: { select: { id: true, name: true, fieldOfExpertise: true, logo: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    const receivedRequests = await prisma.collaborationRequest.findMany({
      where: { receiverId: user.company.id },
      include: {
        sender: { select: { id: true, name: true, fieldOfExpertise: true, logo: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      sentRequests,
      receivedRequests
    })
  } catch (error) {
    console.error("Error fetching collaboration requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { receiverId, message } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Check if request already exists
    const existing = await prisma.collaborationRequest.findFirst({
      where: {
        senderId: user.company.id,
        receiverId,
        status: { in: ["PENDING", "ACCEPTED"] }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Request already exists" }, { status: 400 })
    }

    const receiver = await prisma.company.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    const request = await prisma.collaborationRequest.create({
      data: {
        senderId: user.company.id,
        receiverId,
        message
      },
      include: {
        sender: true,
        receiver: true
      }
    })

    // Notify receiver
    const receiverUser = await prisma.user.findFirst({ where: { companyId: receiverId } })
    if (receiverUser) {
      await prisma.notification.create({
        data: {
          userId: receiverUser.id,
          title: "New Collaboration Request",
          message: `${user.company.name} wants to collaborate with you`,
          type: "COLLABORATION_REQUEST"
        }
      })
    }

    return NextResponse.json({ success: true, request })
  } catch (error) {
    console.error("Error creating collaboration request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
