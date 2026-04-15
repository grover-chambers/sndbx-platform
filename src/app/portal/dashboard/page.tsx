"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Users, Calendar, Briefcase, ArrowRight, Clock, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalCompanies: number
  activeEngagements: number
  totalBookings: number
  pendingMatches: number
  recentActivities: Array<{
    id: string
    type: string
    title: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeEngagements: 0,
    totalBookings: 0,
    pendingMatches: 0,
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        const data = await res.json()
        if (data.success) {
          setStats({
            totalCompanies: data.stats.companies || 0,
            activeEngagements: data.stats.engagements || 0,
            totalBookings: data.stats.bookings || 0,
            pendingMatches: data.stats.activeMatches || 0,
            recentActivities: data.recentActivities || []
          })
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchDashboardData()
    }
  }, [status, router, session])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const statCards = [
    {
      title: "Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "teal",
      change: "+12%",
      changeType: "up"
    },
    {
      title: "Active Engagements",
      value: stats.activeEngagements,
      icon: Briefcase,
      color: "blue",
      change: "+5%",
      changeType: "up"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "green",
      change: "+23%",
      changeType: "up"
    },
    {
      title: "Pending Matches",
      value: stats.pendingMatches,
      icon: Users,
      color: "purple",
      change: "-2%",
      changeType: "down"
    }
  ]

  const getRoleBasedContent = () => {
    const role = session.user?.role || "CLIENT"
    
    const content = {
      CLIENT: {
        welcome: "Welcome back!",
        description: "Find specialist companies, book workspaces, and track your engagements.",
        quickActions: [
          { title: "Find Companies", href: "/companies", icon: Building2, color: "teal" },
          { title: "Book a Space", href: "/bookings", icon: Calendar, color: "blue" },
          { title: "View Engagements", href: "/engagements", icon: Briefcase, color: "purple" },
        ]
      },
      COMPANY_REP: {
        welcome: "Welcome back!",
        description: "Manage your profile, services, and client engagements.",
        quickActions: [
          { title: "Manage Profile", href: "/company/profile", icon: Building2, color: "teal" },
          { title: "View Engagements", href: "/engagements", icon: Briefcase, color: "purple" },
          { title: "Update Services", href: "/company/services", icon: TrendingUp, color: "blue" },
        ]
      },
      ADMIN: {
        welcome: "Welcome back, Admin!",
        description: "Manage companies, clients, bookings, and platform settings.",
        quickActions: [
          { title: "Manage Companies", href: "/admin/companies", icon: Building2, color: "teal" },
          { title: "Match Clients", href: "/admin/matching", icon: Users, color: "green" },
          { title: "View Bookings", href: "/admin/bookings", icon: Calendar, color: "blue" },
          { title: "Settings", href: "/admin/settings", icon: TrendingUp, color: "purple" },
        ]
      },
      SUPER_ADMIN: {
        welcome: "Welcome back, Super Admin!",
        description: "Full platform control and analytics.",
        quickActions: [
          { title: "Manage Admins", href: "/admin/users", icon: Users, color: "teal" },
          { title: "All Companies", href: "/admin/companies", icon: Building2, color: "blue" },
          { title: "Analytics", href: "/admin/analytics", icon: TrendingUp, color: "purple" },
          { title: "System Settings", href: "/admin/settings", icon: CheckCircle, color: "green" },
        ]
      }
    }
    
    return content[role as keyof typeof content] || content.CLIENT
  }

  const roleContent = getRoleBasedContent()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">{roleContent.welcome}</h1>
              <p className="text-white/80 mt-1 text-sm">{roleContent.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{session.user?.name || "User"}</p>
              <p className="text-xs text-white/60">{session.user?.role || "Client"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 md:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.title}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg md:text-xl font-semibold text-navy-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {roleContent.quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 bg-${action.color}-50 rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 text-${action.color}-600`} />
                      </div>
                      <span className="font-medium text-slate-900 text-sm">{action.title}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity & Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            </div>
            <div className="p-4">
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 mt-2 rounded-full bg-teal-500"></div>
                      <div>
                        <p className="text-slate-700">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No recent activity</p>
                  <p className="text-xs text-slate-400 mt-1">Your activity will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Getting Started / Tips */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100/30 rounded-xl border border-teal-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-3">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Complete your profile</p>
                  <p className="text-xs text-slate-500">Add your details to help others find you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Explore the platform</p>
                  <p className="text-xs text-slate-500">Browse companies or update your services</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Connect and grow</p>
                  <p className="text-xs text-slate-500">Start engagements and book workspaces</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
