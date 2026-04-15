import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      where: {
        status: "ACTIVE"  // Only show approved companies
      },
      include: {
        services: {
          take: 3  // Show first 3 services
        },
        users: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ success: true, companies })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}
