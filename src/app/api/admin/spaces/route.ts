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
    const activeOnly = searchParams.get("active") === "true"

    const spaces = await prisma.space.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { type: "asc" }
    })

    return NextResponse.json({ success: true, spaces })
  } catch (error) {
    console.error("Error fetching spaces:", error)
    return NextResponse.json({ error: "Failed to fetch spaces" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, type, capacity, description, hourlyRate, dailyRate, isActive } = body

    const space = await prisma.space.create({
      data: {
        name,
        type,
        capacity,
        description,
        hourlyRate,
        dailyRate,
        isActive,
        images: []
      }
    })

    return NextResponse.json({ success: true, space })
  } catch (error) {
    console.error("Error creating space:", error)
    return NextResponse.json({ error: "Failed to create space" }, { status: 500 })
  }
}
