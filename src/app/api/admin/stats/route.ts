import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalCompanies,
    pendingCompanies,
    totalClients,
    activeEngagements,
    monthlyRevenue,
    todayBookings,
    pendingBookings,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.client.count(),
    prisma.engagement.count({ where: { stage: { in: ["MATCHED","PROPOSAL","ACTIVE"] } } }),
    prisma.invoice.aggregate({
      where: { status: "PAID", paidAt: { gte: startOfMonth } },
      _sum: { amount: true }
    }),
    prisma.booking.count({
      where: { startTime: { gte: new Date(now.setHours(0,0,0,0)) } }
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ])

  return NextResponse.json({
    totalCompanies,
    pendingCompanies,
    totalClients,
    activeEngagements,
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
    todayBookings,
    pendingBookings,
  })
}
