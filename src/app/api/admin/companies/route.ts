import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  const search = searchParams.get("search") || undefined
  const page  = parseInt(searchParams.get("page") || "1")
  const limit = 20

  const where = {
    ...(status && { status }),
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        _count: { select: { users: true, engagements: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.company.count({ where }),
  ])

  return NextResponse.json({ companies, total, page, limit })
}
