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

    let engagements: any[] = []

    if (session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") {
      engagements = await prisma.engagement.findMany({
        include: {
          client: {
            select: { companyName: true }
          },
          company: {
            select: { name: true, slug: true }
          },
          timeline: {
            orderBy: { createdAt: "desc" },
            take: 3
          }
        },
        orderBy: { startedAt: "desc" }
      })
    } else if (session.user.role === "COMPANY_REP") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
      })
      
      if (user?.companyId) {
        engagements = await prisma.engagement.findMany({
          where: { companyId: user.companyId },
          include: {
            client: {
              select: { companyName: true }
            },
            company: {
              select: { name: true, slug: true }
            },
            timeline: {
              orderBy: { createdAt: "desc" },
              take: 3
            }
          },
          orderBy: { startedAt: "desc" }
        })
      }
    } else if (session.user.role === "CLIENT") {
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id }
      })
      
      if (client) {
        engagements = await prisma.engagement.findMany({
          where: { clientId: client.id },
          include: {
            client: {
              select: { companyName: true }
            },
            company: {
              select: { name: true, slug: true }
            },
            timeline: {
              orderBy: { createdAt: "desc" },
              take: 3
            }
          },
          orderBy: { startedAt: "desc" }
        })
      }
    }

    return NextResponse.json({ success: true, engagements })
  } catch (error) {
    console.error("Error fetching engagements:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch engagements" },
      { status: 500 }
    )
  }
}
