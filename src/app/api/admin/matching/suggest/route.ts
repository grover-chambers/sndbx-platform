import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { clientId, needId } = await req.json()

  // Get client and their needs
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      needs: needId ? { where: { id: needId } } : { where: { status: "OPEN" }, take: 1 }
    }
  })

  if (!client || !client.needs.length) {
    return NextResponse.json({ error: "Client or need not found" }, { status: 404 })
  }

  const need = client.needs[0]

  // Get all active companies
  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    include: {
      services: true,
      _count: { select: { engagements: true } }
    }
  })

  // Score companies based on matching criteria
  const scoredCompanies = companies.map(company => {
    let score = 0

    // Match by field of expertise (40% weight)
    if (company.fieldOfExpertise && need.title) {
      const expertiseMatch = company.fieldOfExpertise.toLowerCase().includes(need.title.toLowerCase()) ||
        need.title.toLowerCase().includes(company.fieldOfExpertise.toLowerCase())
      if (expertiseMatch) score += 40
    }

    // Match by services offered (30% weight)
    const serviceMatch = company.services.some(service =>
      service.title.toLowerCase().includes(need.title?.toLowerCase() || "") ||
      need.title?.toLowerCase().includes(service.title.toLowerCase())
    )
    if (serviceMatch) score += 30

    // Past engagement success (20% weight)
    const engagementCount = company._count.engagements
    if (engagementCount > 0) score += Math.min(20, engagementCount * 2)

    // Profile completeness (10% weight)
    if (company.description) score += 5
    if (company.website) score += 3
    if (company.logo) score += 2

    return { ...company, matchScore: score }
  })

  // Sort by score and return top 3
  const suggestions = scoredCompanies
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map((c, i) => ({ ...c, rank: i + 1 }))

  return NextResponse.json({ 
    client, 
    need,
    suggestions,
    totalCompanies: companies.length
  })
}
