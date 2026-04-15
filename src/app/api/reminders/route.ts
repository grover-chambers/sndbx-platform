import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const reminders = await prisma.reminder.findMany({
      where: { 
        userId: session.user.id,
        isCompleted: false
      },
      orderBy: { dueDate: "asc" }
    })

    return NextResponse.json({ success: true, reminders })
  } catch (error) {
    console.error("Failed to fetch reminders:", error)
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { title, description, dueDate, relatedTo, relatedId } = body

    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        relatedTo,
        relatedId,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true, reminder })
  } catch (error) {
    console.error("Failed to create reminder:", error)
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 })
  }
}
