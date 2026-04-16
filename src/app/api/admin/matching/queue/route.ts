import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get clients with completed needs assessments but no active engagements
    const pendingClients = await prisma.client.findMany({
      where: {
        needsAssessment: { isComplete: true },
        engagements: { none: { stage: { in: ["ACTIVE", "PROPOSAL", "MATCHED"] } } }
      },
      include: {
        needsAssessment: true,
        user: { select: { name: true, email: true } }
      },
      orderBy: { needsAssessment: { submittedAt: "asc" } }
    })

    // Get matching stats
    const totalMatches = await prisma.engagement.count()
    const completedMatches = await prisma.engagement.count({ where: { stage: "COMPLETED" } })
    const activeMatches = await prisma.engagement.count({ where: { stage: "ACTIVE" } })

    // Average time to match (using timeline entries)
    const engagementsWithTimeline = await prisma.engagement.findMany({
      include: {
        timeline: {
          where: { stage: "MATCHED" },
          orderBy: { createdAt: "asc" },
          take: 1
        }
      }
    })

    let avgTimeToMatch = 0
    const validMatches = engagementsWithTimeline.filter(e => e.timeline.length > 0)
    if (validMatches.length > 0) {
      const totalDays = validMatches.reduce((sum, e) => {
        const matchDate = e.timeline[0].createdAt
        const days = Math.ceil((matchDate.getTime() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      avgTimeToMatch = Math.round(totalDays / validMatches.length)
    }

    const successRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0

    return NextResponse.json({
      success: true,
      pendingClients,
      stats: {
        totalMatches,
        activeMatches,
        completedMatches,
        successRate,
        avgTimeToMatch
      }
    })
  } catch (error) {
    console.error("Error fetching matching queue:", error)
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 })
  }
}
