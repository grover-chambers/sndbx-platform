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

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json({ success: true, notifications })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, type, userId } = await request.json()

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: userId || session.user.id
      }
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { notificationId, isRead } = await request.json()

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead }
    })

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
