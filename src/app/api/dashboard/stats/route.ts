import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts based on user role
    let companies = 0
    let engagements = 0
    let bookings = 0
    let activeMatches = 0
    let recentActivities: any[] = []

    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
      companies = await prisma.company.count()
      engagements = await prisma.engagement.count()
      bookings = await prisma.booking.count()
      activeMatches = await prisma.engagement.count({
        where: { stage: "MATCHED" }
      })
      
      // Get recent engagements for admin
      const recentEngagements = await prisma.engagement.findMany({
        take: 5,
        orderBy: { startedAt: "desc" },
        include: {
          client: { select: { companyName: true } },
          company: { select: { name: true } }
        }
      })
      
      recentActivities = recentEngagements.map(e => ({
        id: e.id,
        type: "engagement",
        title: `New engagement: ${e.client.companyName} matched with ${e.company.name}`,
        timestamp: e.startedAt.toLocaleDateString()
      }))
    } else if (session.user.role === "COMPANY_REP") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
      })
      if (user?.companyId) {
        engagements = await prisma.engagement.count({
          where: { companyId: user.companyId }
        })
      }
    } else if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id }
      })
      if (client) {
        engagements = await prisma.engagement.count({
          where: { clientId: client.id }
        })
        bookings = await prisma.booking.count({
          where: { clientId: client.id }
        })
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        companies,
        engagements,
        bookings,
        activeMatches
      },
      recentActivities
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}
