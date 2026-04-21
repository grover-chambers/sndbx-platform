export const dynamic = "force-dynamic"
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
    const view = searchParams.get("view") || "calendar"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const spaceId = searchParams.get("spaceId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = 20

    // Build where clause
    const where: any = {}
    if (status && status !== "all") where.status = status
    if (spaceId) where.spaceId = spaceId
    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    if (search) {
      where.OR = [
        { client: { companyName: { contains: search, mode: "insensitive" } } },
        { space: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    // Get all bookings for calendar view with complete data
    let calendarBookings: any[] = []
    if (view === "calendar") {
      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      
      calendarBookings = await prisma.booking.findMany({
        where: {
          startTime: { gte: start, lte: end }
        },
        include: {
          client: { 
            include: { 
              user: { select: { id: true, name: true, email: true } } 
            } 
          },
          space: { select: { id: true, name: true, type: true, capacity: true, hourlyRate: true, description: true } },
        },
        orderBy: { startTime: "asc" }
      })
    }

    // Get bookings with pagination for list view
    let listBookings: any[] = []
    let total = 0
    if (view === "list") {
      listBookings = await prisma.booking.findMany({
        where,
        include: {
          client: { 
            include: { 
              user: { select: { id: true, name: true, email: true } } 
            } 
          },
          space: { select: { id: true, name: true, type: true, capacity: true, hourlyRate: true } },
        },
        orderBy: { startTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      })
      total = await prisma.booking.count({ where })
    }

    // Get analytics
    const analytics = await getAnalytics()

    // Get pending approvals with complete data
    const pendingApprovals = await prisma.booking.findMany({
      where: { status: "PENDING" },
      include: {
        client: { 
          include: { 
            user: { select: { id: true, name: true, email: true } } 
          } 
        },
        space: { select: { id: true, name: true, type: true, hourlyRate: true } },
      },
      orderBy: { startTime: "asc" },
      take: 10
    })

    // Get spaces for filter
    const spaces = await prisma.space.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true }
    })

    return NextResponse.json({
      success: true,
      bookings: view === "list" ? listBookings : calendarBookings,
      total,
      page,
      limit,
      analytics,
      pendingApprovals,
      spaces
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

async function getAnalytics() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const [total, todayBookings, pending, revenue, spaceUtilization] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { startTime: { gte: startOfToday, lt: endOfToday } } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", startTime: { gte: startOfMonth, lt: endOfMonth } },
      _sum: { totalAmount: true }
    }),
    prisma.space.findMany({
      include: {
        bookings: {
          where: {
            status: "CONFIRMED",
            startTime: { gte: startOfMonth, lt: endOfMonth }
          }
        }
      }
    })
  ])

  const utilization = spaceUtilization.map(space => {
    const bookedDays = new Set(space.bookings.map(b => 
      new Date(b.startTime).toDateString()
    )).size
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return {
      id: space.id,
      name: space.name,
      bookedDays,
      totalDays,
      utilizationRate: Math.round((bookedDays / totalDays) * 100)
    }
  })

  // Monthly trend
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const monthlyBookings = await prisma.booking.findMany({
    where: { startTime: { gte: sixMonthsAgo } },
    select: { startTime: true, totalAmount: true, status: true }
  })

  const monthlyTrend: Record<string, any> = {}
  monthlyBookings.forEach(booking => {
    const monthKey = booking.startTime.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (!monthlyTrend[monthKey]) {
      monthlyTrend[monthKey] = { month: monthKey, bookings: 0, revenue: 0, confirmed: 0 }
    }
    monthlyTrend[monthKey].bookings++
    if (booking.totalAmount) monthlyTrend[monthKey].revenue += booking.totalAmount
    if (booking.status === "CONFIRMED") monthlyTrend[monthKey].confirmed++
  })

  return {
    total,
    todayBookings,
    pending,
    revenue: revenue._sum.totalAmount || 0,
    spaceUtilization: utilization,
    monthlyTrend: Object.values(monthlyTrend)
  }
}
