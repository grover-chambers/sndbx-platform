import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import { InvoicePrintView } from "./InvoicePrintView"

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      client: {
        include: { user: { select: { name: true, email: true } } }
      },
      booking: { include: { space: true } },
      engagement: { include: { company: true } },
      user: { select: { name: true } },
    }
  })

  if (!invoice) notFound()

  const isAdmin = session && ["ADMIN","SUPER_ADMIN"].includes(session.user.role)
  const isOwner = session?.user?.id === invoice.client.userId

  if (!isAdmin && !isOwner) notFound()

  return <InvoicePrintView invoice={invoice as any} isAdmin={!!isAdmin} />
}
