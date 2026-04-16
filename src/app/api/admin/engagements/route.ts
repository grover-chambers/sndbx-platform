import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const stage = searchParams.get("stage")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    const where: any = {}
    if (stage) where.stage = stage
    if (search) {
      where.OR = [
        { client: { companyName: { contains: search, mode: "insensitive" } } },
        { company: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    const [engagements, total] = await Promise.all([
      prisma.engagement.findMany({
        where,
        include: {
          client: { select: { id: true, companyName: true, industry: true } },
          company: { select: { id: true, name: true, slug: true, fieldOfExpertise: true } },
          matcher: { select: { name: true, email: true } },
          timeline: { orderBy: { createdAt: "desc" }, take: 5 }
        },
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.engagement.count({ where })
    ])

    // Get analytics data
    const analytics = await getAnalytics()

    return NextResponse.json({ engagements, total, page, limit, analytics })
  } catch (error) {
    console.error("Error fetching engagements:", error)
    return NextResponse.json({ error: "Failed to fetch engagements" }, { status: 500 })
  }
}

async function getAnalytics() {
  try {
    const total = await prisma.engagement.count()
    
    const byStage = await prisma.engagement.groupBy({
      by: ["stage"],
      _count: true
    })
    
    const completed = byStage.find(s => s.stage === "COMPLETED")?._count || 0
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    
    const active = byStage
      .filter(s => ["MATCHED", "PROPOSAL", "ACTIVE"].includes(s.stage))
      .reduce((sum, s) => sum + s._count, 0)
    
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    
    const stalled = await prisma.engagement.count({
      where: {
        stage: { in: ["MATCHED", "PROPOSAL", "ACTIVE"] },
        startedAt: { lt: fourteenDaysAgo }
      }
    })
    
    const totalValueAgg = await prisma.engagement.aggregate({
      where: { stage: { in: ["ACTIVE", "COMPLETED"] } },
      _sum: { dealValue: true }
    })
    const totalValue = totalValueAgg._sum.dealValue || 0
    
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    
    const monthlyEngagements = await prisma.engagement.findMany({
      where: { startedAt: { gte: sixMonthsAgo } },
      select: { startedAt: true, stage: true, dealValue: true }
    })
    
    const monthlyTrend: Record<string, any> = {}
    monthlyEngagements.forEach(eng => {
      const monthKey = eng.startedAt.toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { month: monthKey, engagements: 0, value: 0, completed: 0 }
      }
      monthlyTrend[monthKey].engagements++
      if (eng.dealValue) monthlyTrend[monthKey].value += eng.dealValue
      if (eng.stage === "COMPLETED") monthlyTrend[monthKey].completed++
    })
    
    const topCompanies = await prisma.company.findMany({
      take: 5,
      include: {
        engagements: {
          where: { stage: "COMPLETED" }
        }
      },
      orderBy: { engagements: { _count: "desc" } }
    })
    
    const topCompaniesData = topCompanies.map(c => ({
      id: c.id,
      name: c.name,
      completedEngagements: c.engagements.length
    }))
    
    const topClients = await prisma.client.findMany({
      take: 5,
      include: {
        engagements: true
      },
      orderBy: { engagements: { _count: "desc" } }
    })
    
    const topClientsData = topClients.map(c => ({
      id: c.id,
      name: c.companyName,
      totalEngagements: c.engagements.length
    }))
    
    return {
      total,
      active,
      completed,
      completionRate,
      stalled,
      totalValue,
      byStage: byStage.map(s => ({ stage: s.stage, count: s._count })),
      stageDurations: {},
      monthlyTrend: Object.values(monthlyTrend),
      topCompanies: topCompaniesData,
      topClients: topClientsData
    }
  } catch (error) {
    console.error("Error getting analytics:", error)
    return {
      total: 0,
      active: 0,
      completed: 0,
      completionRate: 0,
      stalled: 0,
      totalValue: 0,
      byStage: [],
      stageDurations: {},
      monthlyTrend: [],
      topCompanies: [],
      topClients: []
    }
  }
}
