import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const engagement = await prisma.engagement.findUnique({
      where: { id: params.id },
      include: {
        client: { 
          include: { user: { select: { name: true, email: true } } }
        },
        company: { 
          include: { users: { select: { name: true, email: true } } }
        },
        matcher: { select: { name: true, email: true } },
        timeline: { orderBy: { createdAt: "desc" } },
        invoices: true
      }
    })

    if (!engagement) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 })
    }

    return NextResponse.json({ engagement })
  } catch (error) {
    console.error("Error fetching engagement:", error)
    return NextResponse.json({ error: "Failed to fetch engagement" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stage, notes, dealValue } = await req.json()

    const current = await prisma.engagement.findUnique({
      where: { id: params.id }
    })

    if (!current) {
      return NextResponse.json({ error: "Engagement not found" }, { status: 404 })
    }

    const engagement = await prisma.engagement.update({
      where: { id: params.id },
      data: {
        stage: stage || undefined,
        notes: notes !== undefined ? notes : undefined,
        dealValue: dealValue !== undefined ? dealValue : undefined,
        completedAt: stage === "COMPLETED" ? new Date() : undefined
      }
    })

    if (stage && stage !== current.stage) {
      await prisma.engagementTimeline.create({
        data: {
          engagementId: params.id,
          stage: stage,
          note: `Stage updated to ${stage} by ${session.user.name || session.user.email}`
        }
      })
    }

    if (notes && notes !== current.notes) {
      await prisma.engagementTimeline.create({
        data: {
          engagementId: params.id,
          stage: engagement.stage,
          note: `Admin note: ${notes}`
        }
      })
    }

    return NextResponse.json({ engagement })
  } catch (error) {
    console.error("Error updating engagement:", error)
    return NextResponse.json({ error: "Failed to update engagement" }, { status: 500 })
  }
}
