import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  // Create response that redirects to home page
  const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"))
  
  // Clear all NextAuth session cookies
  response.cookies.delete("next-auth.session-token")
  response.cookies.delete("next-auth.csrf-token")
  response.cookies.delete("next-auth.callback-url")
  response.cookies.delete("__Secure-next-auth.session-token")
  
  return response
}
