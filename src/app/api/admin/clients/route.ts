import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || undefined
  const page   = parseInt(searchParams.get("page") || "1")
  const limit  = 20

  const where = search ? {
    OR: [
      { companyName: { contains: search, mode: "insensitive" as const } },
      { user: { name: { contains: search, mode: "insensitive" as const } } },
      { user: { email: { contains: search, mode: "insensitive" as const } } },
    ]
  } : {}

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { engagements: true, bookings: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ])

  return NextResponse.json({ clients, total, page, limit })
}
