import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Check if user is admin
  if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
    redirect("/portal/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2 flex justify-end">
          <NotificationBell />
        </div>
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
