import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, image: true }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { name, image, phone, title } = body

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image },
      select: { id: true, name: true, email: true, role: true, image: true }
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}
