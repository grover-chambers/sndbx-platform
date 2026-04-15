import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Get all unmatched client needs and available companies
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get clients with open needs
  const clients = await prisma.client.findMany({
    where: {
      status: "ACTIVE",
      needs: { some: { status: "OPEN" } }
    },
    include: {
      user: { select: { name: true, email: true } },
      needs: { where: { status: "OPEN" } }
    }
  })

  return NextResponse.json({ clients })
}

// Create a new engagement (match)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { clientId, companyId, needId, dealValue, notes } = await req.json()

  // Get client and company
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: { user: true }
  })
  
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { users: { take: 1 } }
  })

  if (!client || !company) {
    return NextResponse.json({ error: "Client or company not found" }, { status: 404 })
  }

  // Create engagement
  const engagement = await prisma.engagement.create({
    data: {
      clientId,
      companyId,
      stage: "MATCHED",
      dealValue: dealValue || null,
      notes: notes || null,
      matchedBy: session.user.id,
    }
  })

  // Update client need status if needId provided
  if (needId) {
    await prisma.clientNeed.update({
      where: { id: needId },
      data: { status: "MATCHED" }
    })
  }

  // Create notifications for both parties
  const notifications = []
  
  // Notification for client
  notifications.push({
    userId: client.userId,
    title: "You've been matched!",
    message: `You have been matched with ${company.name}. The admin will reach out with next steps.`,
    type: "MATCH_ALERT",
  })
  
  // Notification for company (if there's a user)
  if (company.users && company.users.length > 0) {
    notifications.push({
      userId: company.users[0].id,
      title: "New client match!",
      message: `You have been matched with ${client.companyName}. Check your dashboard for details.`,
      type: "MATCH_ALERT",
    })
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications
    })
  }

  return NextResponse.json({ success: true, engagement })
}
