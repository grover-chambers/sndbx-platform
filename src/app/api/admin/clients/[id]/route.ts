import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      engagements: {
        take: 10,
        orderBy: { startedAt: "desc" },
        include: { company: { select: { name: true } } }
      },
      _count: { select: { engagements: true, bookings: true } }
    }
  })

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  return NextResponse.json({ client })
}
