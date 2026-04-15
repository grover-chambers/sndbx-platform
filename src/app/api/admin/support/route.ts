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
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")

    const where: any = {}
    if (status && status !== "all") where.status = status
    if (priority && priority !== "all") where.priority = priority
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } }
      ]
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, role: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json({ success: true, tickets })
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return NextResponse.json({ success: true, tickets: [] })
  }
}
