import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search")
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }
    if (role && role !== "all") where.role = role
    if (status) where.status = status

    console.log("Fetching users with where:", where)

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          company: { 
            select: { 
              id: true, 
              name: true, 
              status: true, 
              fieldOfExpertise: true 
            } 
          },
          clientProfile: { 
            select: { 
              id: true, 
              companyName: true, 
              industry: true, 
              size: true 
            } 
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    console.log(`Found ${users.length} users out of ${total} total`)

    // Get engagement counts and bookings for each user
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      // Get engagements where user is client (using startedAt instead of createdAt)
      const engagements = await prisma.engagement.findMany({
        where: { client: { userId: user.id } },
        include: { company: { select: { name: true } } },
        orderBy: { startedAt: "desc" },
        take: 10
      })
      
      // Get bookings
      const bookings = await prisma.booking.findMany({
        where: { client: { userId: user.id } },
        include: { space: { select: { name: true } } },
        orderBy: { startTime: "desc" },
        take: 10
      })
      
      // Calculate total spent from bookings
      const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      
      return { 
        ...user, 
        engagements,
        bookings,
        engagementCount: engagements.length,
        bookingCount: bookings.length,
        totalSpent
      }
    }))

    return NextResponse.json({ 
      users: usersWithDetails, 
      total, 
      page, 
      limit 
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
