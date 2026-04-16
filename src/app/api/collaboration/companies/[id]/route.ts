import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id, status: "ACTIVE" },
      include: {
        services: true,
        users: { select: { name: true, email: true } },
        _count: {
          select: {
            engagements: { where: { stage: "COMPLETED" } },
            sentCollaborations: { where: { status: "ACCEPTED" } },
            receivedCollaborations: { where: { status: "ACCEPTED" } }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 })
  }
}
