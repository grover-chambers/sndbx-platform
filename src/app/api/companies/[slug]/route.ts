import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: {
        slug: params.slug,
        status: "ACTIVE"
      },
      include: {
        services: true,
        users: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
      { status: 500 }
    )
  }
}
