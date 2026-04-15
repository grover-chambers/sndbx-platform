"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Building2, Users, Briefcase, Calendar, DollarSign,
  TrendingUp, Clock, CheckCircle, Loader2, Activity,
  Target, Award, Zap, AlertCircle, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface Stats {
  totalCompanies: number
  pendingCompanies: number
  totalClients: number
  activeEngagements: number
  monthlyRevenue: number
  todayBookings: number
  pendingBookings: number
  revenueGrowth?: number
  engagementGrowth?: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [chartData, setChartData] = useState([
    { month: "Jan", users: 45, revenue: 12000 },
    { month: "Feb", users: 52, revenue: 15000 },
    { month: "Mar", users: 58, revenue: 18000 },
    { month: "Apr", users: 65, revenue: 22000 },
    { month: "May", users: 72, revenue: 28000 },
    { month: "Jun", users: 78, revenue: 35000 },
  ])
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: "company", action: "New company registered", name: "Tech Solutions Ltd", time: "2 hours ago", status: "pending" },
    { id: 2, type: "engagement", action: "New engagement created", name: "Creative Agency x TechCorp", time: "5 hours ago", status: "active" },
    { id: 3, type: "booking", action: "New workspace booking", name: "Boardroom A booked", time: "Yesterday", status: "confirmed" },
    { id: 4, type: "client", action: "New client registered", name: "FinTech Kenya", time: "Yesterday", status: "active" },
  ])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      router.push("/portal/client/dashboard")
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        const data = await res.json()
        setStats({
          ...data,
          revenueGrowth: 23,
          engagementGrowth: 15
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [status, session, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const statCards = [
    { title: "Total Companies", value: stats?.totalCompanies || 0, icon: Building2, color: "blue", change: "+8%", href: "/admin/companies" },
    { title: "Active Clients", value: stats?.totalClients || 0, icon: Users, color: "teal", change: "+12%", href: "/admin/clients" },
    { title: "Active Engagements", value: stats?.activeEngagements || 0, icon: Briefcase, color: "green", change: "+23%", href: "/admin/engagements" },
    { title: "Monthly Revenue", value: `KES ${stats?.monthlyRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: "purple", change: `+${stats?.revenueGrowth || 0}%`, href: "/admin/financials" },
  ]

  const secondaryStats = [
    { title: "Today's Bookings", value: stats?.todayBookings || 0, icon: Calendar, color: "slate", href: "/admin/bookings" },
    { title: "Pending Approvals", value: stats?.pendingCompanies || 0, icon: Clock, color: "amber", href: "/admin/companies?status=PENDING" },
    { title: "Pending Bookings", value: stats?.pendingBookings || 0, icon: AlertCircle, color: "orange", href: "/admin/bookings?status=PENDING" },
  ]

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-50 text-blue-600",
      teal: "bg-teal-50 text-teal-600",
      purple: "bg-purple-50 text-purple-600",
      green: "bg-green-50 text-green-600",
      amber: "bg-amber-50 text-amber-600",
      slate: "bg-slate-50 text-slate-600",
      orange: "bg-orange-50 text-orange-600",
    }
    return colors[color] || colors.slate
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]"></div>
        <div className="relative px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
              <p className="text-white/70 mt-1 text-sm">Welcome back, {session?.user?.name || "Admin"}!</p>
            </div>
            <div className="flex gap-2 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-3 py-1.5 text-xs rounded-md transition ${timeRange === "week" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-3 py-1.5 text-xs rounded-md transition ${timeRange === "month" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-3 py-1.5 text-xs rounded-md transition ${timeRange === "year" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Pending Alert Banner */}
        {stats?.pendingCompanies && stats.pendingCompanies > 0 && (
          <Link href="/admin/companies?status=PENDING">
            <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-5 py-3.5 hover:shadow-md transition cursor-pointer group">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  <span className="font-bold">{stats.pendingCompanies} companies</span> are waiting for approval
                </p>
                <p className="text-xs text-amber-600/70">Review and activate them to unlock platform features</p>
              </div>
              <span className="text-xs font-medium text-amber-600 group-hover:underline">Review now →</span>
            </div>
          </Link>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Link key={i} href={stat.href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconColor(stat.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{stat.title}</p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {secondaryStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Link key={i} href={stat.href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconColor(stat.color)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Platform Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#00C49F" strokeWidth={2} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div> Users</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div> Revenue (KES)</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Booking Fees", value: 45000, color: "#0088FE" },
                    { name: "Deal Commissions", value: 80000, color: "#00C49F" },
                    { name: "Subscriptions", value: 25000, color: "#FFBB28" },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                  <Cell fill="#FFBB28" />
                </Pie>
                <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-sm text-slate-600">Total Platform Revenue: <span className="font-bold text-navy-900">KES 150,000</span></p>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Recent Platform Activity
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === "pending" ? "bg-amber-500" :
                    activity.status === "active" ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{activity.action}</span>
                      <span className="text-slate-500"> - {activity.name}</span>
                    </p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                  {activity.status === "pending" && (
                    <Link href="/admin/companies" className="text-xs text-teal-600 hover:underline">
                      Review →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin/companies?status=PENDING" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition group">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Review Pending Approvals</p>
                  <p className="text-xs text-slate-500">{stats?.pendingCompanies || 0} companies waiting</p>
                </div>
              </Link>
              <Link href="/admin/matching" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition group">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Match Clients with Companies</p>
                  <p className="text-xs text-slate-500">Connect clients to specialist firms</p>
                </div>
              </Link>
              <Link href="/admin/financials" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition group">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">View Financial Report</p>
                  <p className="text-xs text-slate-500">Revenue and invoice summary</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
