import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const reminder = await prisma.reminder.update({
      where: { id: params.id },
      data: { isCompleted: true }
    })

    return NextResponse.json({ success: true, reminder })
  } catch (error) {
    console.error("Failed to update reminder:", error)
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await prisma.reminder.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete reminder:", error)
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 })
  }
}
