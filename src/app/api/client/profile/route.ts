import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { companyName, industry, size } = body

    const client = await prisma.client.update({
      where: { userId: session.user.id },
      data: {
        companyName: companyName || undefined,
        industry: industry || undefined,
        size: size || undefined
      }
    })

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}
