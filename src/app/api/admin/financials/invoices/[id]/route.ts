import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: {
        include: {
          user: { select: { name: true, email: true, image: true } },
          needs: true,
        }
      },
      booking: { include: { space: true } },
      engagement: { include: { company: true } },
      user: { select: { name: true, email: true } },
    }
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ invoice })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { status, mpesaCode } = body

  const invoice = await prisma.invoice.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(mpesaCode && {
        paymentMethod: "mpesa",
        status: "PAID",
        paidAt: new Date(),
      }),
    },
    include: {
      client: { include: { user: true } }
    }
  })

  // If client submitted mpesa code — notify all admins
  if (mpesaCode) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true }
    })
    await prisma.notification.createMany({
      data: admins.map(a => ({
        userId: a.id,
        title: "M-Pesa Payment Submitted",
        message: `${invoice.client.user.name || invoice.client.companyName} submitted M-Pesa code ${mpesaCode} for invoice ${invoice.invoiceNumber}.`,
        type: "MPESA_PAYMENT",
      }))
    })
  }

  return NextResponse.json({ invoice })
}
