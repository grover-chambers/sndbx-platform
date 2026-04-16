import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const expertise = searchParams.get("expertise")
    const search = searchParams.get("search")

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const where: any = {
      status: "ACTIVE",
      id: { not: user.company.id }
    }

    if (expertise) {
      where.fieldOfExpertise = expertise
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ]
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        services: { take: 3 },
        _count: { select: { engagements: true, sentCollaborations: true, receivedCollaborations: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    // Get expertise list for filtering
    const expertiseList = await prisma.company.groupBy({
      by: ["fieldOfExpertise"],
      where: { status: "ACTIVE", fieldOfExpertise: { not: null } }
    })

    return NextResponse.json({
      success: true,
      companies,
      expertise: expertiseList.map(e => e.fieldOfExpertise).filter(Boolean)
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}
