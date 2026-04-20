import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/lib/invoiceUtils"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || undefined
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20

  const where = { ...(status && { status: status as any }) }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: {
          include: { user: { select: { name: true, email: true } } }
        },
        booking: { include: { space: true } },
        engagement: { include: { company: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ])

  return NextResponse.json({ invoices, total })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.user.role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { clientId, amount, dueDate, lineItems, type, id, bookingId, notes, engagementId } = body

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      clientId,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      status: "SENT",
      userId: session.user.id,
      ...(engagementId && { engagementId: id }),
      ...(bookingId && { bookingId }),
    },
  })

  // Notify client
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { userId: true }
  })
  if (client) {
    await prisma.notification.create({
      data: {
        userId: client.userId,
        title: "New Invoice",
        message: `Invoice ${invoice.invoiceNumber} for KES ${amount.toLocaleString()} is ready for payment.`,
        type: "INVOICE",
      }
    })
  }

  return NextResponse.json({ invoice })
}
// Already complete above — no changes needed
