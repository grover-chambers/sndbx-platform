import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, teamMembers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { email, name, role } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Check if user already invited
    const existing = await prisma.teamMember.findFirst({
      where: { email, companyId: user.company.id }
    })

    if (existing) {
      return NextResponse.json({ error: "User already invited" }, { status: 400 })
    }

    const token = randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    const teamMember = await prisma.teamMember.create({
      data: {
        email,
        name: name || null,
        role,
        token,
        expiresAt,
        companyId: user.company.id,
        invitedBy: session.user.id
      }
    })

    // TODO: Send invitation email

    return NextResponse.json({ success: true, teamMember })
  } catch (error) {
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 })
  }
}
