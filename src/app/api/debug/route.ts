import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()

    // Check if users exist
    const userCount = await prisma.user.count()

    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: "admin" } },
      select: { id: true, email: true, role: true, password: true }
    })

    return NextResponse.json({
      success: true,
      dbConnected: true,
      userCount,
      testUser: testUser ? {  
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        hasPassword: !!testUser.password
      } : null
    }) 
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
