"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Users,
  Target,
  Handshake,
  CalendarDays,
  DollarSign,
  HelpCircle,
  Settings,
  ShieldCheck,
  LogOut,
  FileCheck
} from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verification", href: "/admin/verification", icon: FileCheck },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Matching", href: "/admin/matching", icon: Target },
  { label: "Engagements", href: "/admin/engagements", icon: Handshake },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { label: "Financials", href: "/admin/financials", icon: DollarSign },
  { label: "Support", href: "/admin/support", icon: HelpCircle },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    window.location.href = "/api/auth/signout"
  }

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span className="text-white font-semibold text-sm">Admin Panel</span>
        </div>
        <p className="text-white/40 text-xs mt-1">SNDBX Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/70 hover:bg-red-600/20 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
