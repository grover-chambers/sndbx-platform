import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    return NextResponse.json({ success: true, message: "Database connected!" })
  } catch (error) {
    console.error("DB Error:", error)
    return NextResponse.json({
      success: false,
      error: String(error),
      env: {
        databaseUrl: process.env.DATABASE_URL?.substring(0, 50) + "..."
      }
    }, { status: 500 })
  }
}
