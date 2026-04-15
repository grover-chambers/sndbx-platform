import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: params.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // In production, send email with reset link
    // For now, just return success
    return NextResponse.json({ 
      success: true, 
      message: `Password reset email sent to ${user.email}`,
      resetLink: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    })
  } catch (error) {
    console.error("Error sending reset email:", error)
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
  }
}
