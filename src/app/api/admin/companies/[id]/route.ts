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

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      services: { select: { id: true, title: true, description: true, pricing: true } },
      _count: { select: { users: true, engagements: true, services: true } }
    }
  })

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  return NextResponse.json({ company })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { status } = await req.json()
  const company = await prisma.company.update({
    where: { id: params.id },
    data: { status },
  })

  // Notify company users
  const users = await prisma.user.findMany({ where: { companyId: params.id } })
  if (users.length > 0) {
    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title: status === "ACTIVE" ? "Company approved!" : "Company status updated",
        message: status === "ACTIVE"
          ? "Your company profile has been approved. You can now access all features."
          : `Your company status has been changed to ${status}.`,
        type: "COMPANY_STATUS",
      }))
    })
  }

  return NextResponse.json({ company })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, description, fieldOfExpertise, website, email, phone, location } = await req.json()

  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      name: name || undefined,
      description: description || undefined,
      fieldOfExpertise: fieldOfExpertise || undefined,
      website: website || undefined,
      email: email || undefined,
      phone: phone || undefined,
      location: location || undefined,
    },
  })

  return NextResponse.json({ company })
}
