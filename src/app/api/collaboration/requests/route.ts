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

    const activeCollaborations = await prisma.collaborationRequest.findMany({
      where: {
        OR: [
          { senderId: user.company.id, status: "ACCEPTED" },
          { receiverId: user.company.id, status: "ACCEPTED" }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, fieldOfExpertise: true, logo: true } },
        receiver: { select: { id: true, name: true, fieldOfExpertise: true, logo: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        tasks: { where: { status: { not: "COMPLETED" } } }
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      sentRequests,
      receivedRequests,
      activeCollaborations
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
    const { receiverId, message, projectScope, timeline } = body

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

    // Auto-approve if same expertise
    const isSameExpertise = user.company.fieldOfExpertise === receiver.fieldOfExpertise
    const status = isSameExpertise ? "ACCEPTED" : "PENDING"

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 14)

    const request = await prisma.collaborationRequest.create({
      data: {
        senderId: user.company.id,
        receiverId,
        message,
        projectScope,
        timeline,
        status,
        expiresAt
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
          title: isSameExpertise ? "New Collaboration Request" : "New Collaboration Request (Pending Approval)",
          message: `${user.company.name} wants to collaborate with you on: ${projectScope || "a project"}`,
          type: "COLLABORATION_REQUEST"
        }
      })
    }

    // If auto-approved, create initial milestone
    if (isSameExpertise) {
      await prisma.collaborationMilestone.create({
        data: {
          collaborationId: request.id,
          title: "Project Kickoff",
          description: "Initial meeting to discuss project details",
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }

    // Notify admin if different expertise
    if (!isSameExpertise) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } }
      })
      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: "Collaboration Request Needs Approval",
            message: `${user.company.name} (${user.company.fieldOfExpertise}) wants to collaborate with ${receiver.name} (${receiver.fieldOfExpertise})`,
            type: "COLLABORATION_APPROVAL"
          }))
        })
      }
    }

    return NextResponse.json({ success: true, request, autoApproved: isSameExpertise })
  } catch (error) {
    console.error("Error creating collaboration request:", error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}
