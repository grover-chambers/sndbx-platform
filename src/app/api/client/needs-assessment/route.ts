import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      include: { needsAssessment: true }
    })

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    return NextResponse.json({ success: true, assessment: client.needsAssessment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assessment" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
      include: { needsAssessment: true }
    })

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 })

    const body = await req.json()
    const {
      industry, companySize, revenueRange,
      serviceTypes, budgetRange, timeline,
      engagementType, locationPref, additionalContext
    } = body

    const isFirstSubmission = !client.needsAssessment

    const assessment = await prisma.needsAssessment.upsert({
      where: { clientId: client.id },
      update: {
        industry, companySize, revenueRange,
        serviceTypes, budgetRange, timeline,
        engagementType, locationPref, additionalContext,
        isComplete: true,
        isFirstSubmission: false,
        updatedAt: new Date()
      },
      create: {
        clientId: client.id,
        industry, companySize, revenueRange,
        serviceTypes: serviceTypes || [],
        budgetRange, timeline,
        engagementType, locationPref, additionalContext,
        isComplete: true,
        isFirstSubmission: true,
        submittedAt: new Date()
      }
    })

    // Only notify admin on first submission
    if (isFirstSubmission) {
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        select: { id: true }
      })

      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: "New Needs Assessment Submitted",
          message: `${client.companyName} has submitted their needs assessment and is ready for matching.`,
          type: "MATCHING_READY"
        }))
      })
    }

    return NextResponse.json({ success: true, assessment, isFirstSubmission })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
  }
}
