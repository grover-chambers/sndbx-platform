"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Briefcase,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  UserCircle,
  MessageSquare,
  HelpCircle
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const userRole = session?.user?.role || "CLIENT"

  // Client nav items
  const clientNavItems = [
    { title: "Dashboard", href: "/portal/client/dashboard", icon: LayoutDashboard },
    { title: "Companies", href: "/portal/companies", icon: Building2 },
    { title: "Bookings", href: "/portal/bookings", icon: Calendar },
    { title: "Engagements", href: "/portal/engagements", icon: Briefcase },
    { title: "Messages", href: "/portal/client/messages", icon: MessageSquare },
    { title: "Support", href: "/portal/support", icon: HelpCircle },
    { title: "Profile", href: "/portal/client/profile", icon: UserCircle },
  ]

  // Company rep nav items
  const companyNavItems = [
    { title: "Dashboard", href: "/portal/company/dashboard", icon: LayoutDashboard },
    { title: "Company Profile", href: "/portal/company/profile", icon: Building2 },
    { title: "Services", href: "/portal/company/services", icon: Briefcase },
    { title: "Engagements", href: "/portal/engagements", icon: Briefcase },
    { title: "Messages", href: "/portal/company/messages", icon: MessageSquare },
    { title: "Schedule", href: "/portal/company/schedule", icon: Calendar },
    { title: "Support", href: "/portal/support", icon: HelpCircle },
    { title: "Profile", href: "/portal/company/profile", icon: UserCircle },
  ]

  const navItems = userRole === "COMPANY_REP" ? companyNavItems : clientNavItems

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  const toggleSidebar = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false)
    }
  }
  
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ 
        callbackUrl: '/auth/login',  // Redirect to login page after sign out
        redirect: true 
      })
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-navy-900 to-navy-800 
          shadow-xl transition-all duration-300 z-40 overflow-y-auto
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} p-4 border-b border-white/10`}>
          {!isCollapsed && (
            <Link href={userRole === "COMPANY_REP" ? "/portal/company/dashboard" : "/portal/client/dashboard"} className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">SNDBX</span>
              <span className="text-xs bg-teal-600 text-white px-1.5 py-0.5 rounded">Hub</span>
            </Link>
          )}
          {isCollapsed && (
            <Link href={userRole === "COMPANY_REP" ? "/portal/company/dashboard" : "/portal/client/dashboard"} className="text-2xl font-bold text-white">
              S
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 transition text-white/60 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Info */}
        <div className={`p-4 border-b border-white/10 ${isCollapsed ? "text-center" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {userRole === "COMPANY_REP" ? "Company Rep" : "Client"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all duration-150
                  ${isActive 
                    ? "bg-teal-600 text-white shadow-lg" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className={`p-4 border-t border-white/10 ${isCollapsed ? "text-center" : ""}`}>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
              text-white/70 hover:bg-red-600/20 hover:text-red-400 w-full disabled:opacity-50
              ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{isSigningOut ? "Signing out..." : "Sign Out"}</span>}
          </button>
        </div>
      </aside>

      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`} />
    </>
  )
}
