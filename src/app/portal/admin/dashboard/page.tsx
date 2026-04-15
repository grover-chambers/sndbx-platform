"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Users, Building2, Briefcase, Calendar, DollarSign,
  TrendingUp, Clock, CheckCircle, Loader2, ArrowUp,
  ArrowDown, Activity, UserPlus, Building, FileText
} from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  totalClients: number
  totalEngagements: number
  activeEngagements: number
  totalBookings: number
  pendingApprovals: number
  totalRevenue: number
  monthlyRevenue: number
  revenueGrowth: number
  userGrowth: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalClients: 0,
    totalEngagements: 0,
    activeEngagements: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    revenueGrowth: 12,
    userGrowth: 8
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [chartData, setChartData] = useState([
    { month: "Jan", users: 45, revenue: 12000 },
    { month: "Feb", users: 52, revenue: 15000 },
    { month: "Mar", users: 58, revenue: 18000 },
    { month: "Apr", users: 65, revenue: 22000 },
    { month: "May", users: 72, revenue: 28000 },
    { month: "Jun", users: 78, revenue: 35000 },
  ])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch real data from APIs
        const [companiesRes, clientsRes, engagementsRes, bookingsRes] = await Promise.all([
          fetch("/api/companies"),
          fetch("/api/clients"),
          fetch("/api/engagements"),
          fetch("/api/bookings")
        ])

        const companiesData = await companiesRes.json()
        const clientsData = await clientsRes.json()
        const engagementsData = await engagementsRes.json()
        const bookingsData = await bookingsRes.json()

        const companies = companiesData.companies || []
        const clients = clientsData.clients || []
        const engagements = engagementsData.engagements || []
        const bookings = bookingsData.bookings || []

        setStats({
          totalUsers: companies.length + clients.length,
          totalCompanies: companies.length,
          totalClients: clients.length,
          totalEngagements: engagements.length,
          activeEngagements: engagements.filter((e: any) => e.stage === "ACTIVE").length,
          totalBookings: bookings.length,
          pendingApprovals: companies.filter((c: any) => c.status === "PENDING").length,
          totalRevenue: 125000,
          monthlyRevenue: 35000,
          revenueGrowth: 12,
          userGrowth: 8
        })

        // Set recent activities
        setRecentActivities([
          { id: 1, type: "company", action: "New company registered", name: "Tech Solutions Ltd", time: "2 hours ago", status: "pending" },
          { id: 2, type: "engagement", action: "New engagement created", name: "Creative Agency x TechCorp", time: "5 hours ago", status: "active" },
          { id: 3, type: "booking", action: "New workspace booking", name: "Boardroom A booked", time: "Yesterday", status: "confirmed" },
          { id: 4, type: "client", action: "New client registered", name: "FinTech Kenya", time: "Yesterday", status: "active" },
        ])

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "blue", change: `+${stats.userGrowth}%` },
    { title: "Companies", value: stats.totalCompanies, icon: Building2, color: "teal", change: "+5%" },
    { title: "Clients", value: stats.totalClients, icon: UserPlus, color: "purple", change: "+12%" },
    { title: "Engagements", value: stats.totalEngagements, icon: Briefcase, color: "green", change: "+23%" },
    { title: "Active Deals", value: stats.activeEngagements, icon: TrendingUp, color: "amber", change: "+8%" },
    { title: "Bookings", value: stats.totalBookings, icon: Calendar, color: "pink", change: "+15%" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "orange", change: "waiting" },
    { title: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "green", change: `+${stats.revenueGrowth}%` },
  ]

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-50 text-blue-600",
      teal: "bg-teal-50 text-teal-600",
      purple: "bg-purple-50 text-purple-600",
      green: "bg-green-50 text-green-600",
      amber: "bg-amber-50 text-amber-600",
      pink: "bg-pink-50 text-pink-600",
      orange: "bg-orange-50 text-orange-600",
    }
    return colors[color] || colors.blue
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Platform overview and key metrics</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 ${getIconColor(stat.color)} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.title}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
              <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div> Revenue ($)</span>
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
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Recent Activity
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
                    <Link href="/portal/admin/companies" className="text-xs text-teal-600 hover:underline">
                      Review →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/portal/admin/companies?tab=pending" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Review Pending Approvals</p>
                  <p className="text-xs text-slate-500">{stats.pendingApprovals} companies waiting</p>
                </div>
              </Link>
              <Link href="/portal/admin/matching" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">Match Clients</p>
                  <p className="text-xs text-slate-500">Connect clients with companies</p>
                </div>
              </Link>
              <Link href="/portal/admin/financial" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-purple-600" />
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
