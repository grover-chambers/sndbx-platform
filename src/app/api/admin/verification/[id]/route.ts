import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, interviewDate, interviewLocation, interviewType, rejectionReason } = body

    // Update verification record - using the correct model name
    await prisma.companyVerification.update({
      where: { companyId: params.id },
      data: {
        verificationStatus: status,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewLocation,
        interviewType,
        rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
        reviewedBy: session.user.id,
        reviewedAt: status === "APPROVED" || status === "REJECTED" ? new Date() : undefined,
      }
    })

    // If approved, update company status
    if (status === "APPROVED") {
      await prisma.company.update({
        where: { id: params.id },
        data: { status: "ACTIVE" }
      })

      // Notify company reps
      const company = await prisma.company.findUnique({
        where: { id: params.id },
        include: { users: true }
      })

      if (company && company.users.length > 0) {
        await prisma.notification.createMany({
          data: company.users.map(user => ({
            userId: user.id,
            title: "Company Approved!",
            message: "Your company has been approved. You can now access all platform features.",
            type: "COMPANY_APPROVED",
          }))
        })
      }
    }

    // If interview scheduled, notify company
    if (status === "INTERVIEW_SCHEDULED") {
      const company = await prisma.company.findUnique({
        where: { id: params.id },
        include: { users: true }
      })

      if (company && company.users.length > 0) {
        await prisma.notification.createMany({
          data: company.users.map(user => ({
            userId: user.id,
            title: "Interview Scheduled",
            message: `Your verification interview has been scheduled for ${new Date(interviewDate).toLocaleString()}. Location: ${interviewLocation}`,
            type: "INTERVIEW_SCHEDULED",
          }))
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating verification:", error)
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 })
  }
}
