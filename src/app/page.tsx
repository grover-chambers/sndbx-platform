import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import HomePage from "./home-page"

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  
  // If user is logged in, redirect to their respective dashboard
  if (session) {
    const role = session.user.role
    
    // Admin redirect
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      redirect("/admin/dashboard")
    }
    // Company rep redirect
    else if (role === "COMPANY_REP") {
      redirect("/portal/company/dashboard")
    }
    // Client redirect
    else if (role === "CLIENT") {
      redirect("/portal/client/dashboard")
    }
    // Fallback
    else {
      redirect("/portal/dashboard")
    }
  }
  
  // Show landing page for non-authenticated users
  return <HomePage />
}
