import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    console.log("Company Profile API - Session:", session?.user?.email)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // First, find the user with their company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        company: {
          include: {
            services: true,
            documents: true
          }
        }
      }
    })

    console.log("Company Profile API - User found:", user?.email, "Company ID:", user?.companyId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.company) {
      return NextResponse.json({ 
        success: false, 
        error: "No company associated with this user. Please contact support.",
        debug: { userId: user.id, hasCompany: false }
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      company: {
        ...user.company,
        services: user.company.services || [],
        documents: user.company.documents || []
      }
    })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch company: " + String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, fieldOfExpertise, website, logo } = body

    // Find the user with their company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.company) {
      return NextResponse.json({ error: "Company not found for this user" }, { status: 404 })
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        fieldOfExpertise: fieldOfExpertise !== undefined ? fieldOfExpertise : undefined,
        website: website !== undefined ? website : undefined,
        logo: logo !== undefined ? logo : undefined
      }
    })

    return NextResponse.json({ success: true, company: updatedCompany })
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Failed to update company: " + String(error) },
      { status: 500 }
    )
  }
}
