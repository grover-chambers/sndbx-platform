import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            services: true
          }
        }
      }
    })

    if (!user?.company) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, services: user.company.services })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, pricing } = body

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const service = await prisma.service.create({
      data: {
        title,
        description: description || null,
        pricing: pricing || null,
        companyId: user.company.id
      }
    })

    return NextResponse.json({ success: true, service })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    )
  }
}
