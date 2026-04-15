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

    const spaces = await prisma.space.findMany({
      where: {
        isActive: true
      },
      include: {
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
            startTime: { gte: new Date() }
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            client: {
              select: { companyName: true }
            }
          }
        }
      },
      orderBy: { type: "asc" }
    })

    // Calculate availability for each space
    const spacesWithAvailability = spaces.map(space => {
      const bookings = space.bookings
      delete (space as any).bookings
      return {
        ...space,
        bookings,
        available: true
      }
    })

    return NextResponse.json({ success: true, spaces: spacesWithAvailability })
  } catch (error) {
    console.error("Error fetching spaces:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch spaces" }, { status: 500 })
  }
}
