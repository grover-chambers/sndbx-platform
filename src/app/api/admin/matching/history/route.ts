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

    const matches = await prisma.engagement.findMany({
      take: 20,
      orderBy: { startedAt: "desc" },
      include: {
        client: { select: { companyName: true } },
        company: { select: { name: true } }
      }
    })

    const formattedMatches = matches.map(m => ({
      id: m.id,
      clientName: m.client.companyName,
      companyName: m.company.name,
      stage: m.stage,
      dealValue: m.dealValue || 0,
      date: m.startedAt.toISOString()
    }))

    return NextResponse.json({ success: true, matches: formattedMatches })
  } catch (error) {
    console.error("Error fetching match history:", error)
    return NextResponse.json({ error: "Failed to fetch match history" }, { status: 500 })
  }
}
