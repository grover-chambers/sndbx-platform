import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    })

    if (!user?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { companyId: user.company.id, status: "ACTIVE" },
      include: {
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    })

    // Mock activity data (would come from an activity log table)
    const activities = [
      { id: "1", memberName: "John Doe", action: "added a new service", timestamp: new Date(), type: "service" },
      { id: "2", memberName: "Jane Smith", action: "responded to client inquiry", timestamp: new Date(Date.now() - 3600000), type: "message" },
      { id: "3", memberName: "Mike Johnson", action: "updated company profile", timestamp: new Date(Date.now() - 86400000), type: "profile" },
    ]

    return NextResponse.json({ success: true, activities, teamMembers })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team activity" }, { status: 500 })
  }
}
