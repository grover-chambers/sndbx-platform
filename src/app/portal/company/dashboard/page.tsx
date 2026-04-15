"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Briefcase, TrendingUp, CheckCircle, Clock, Users,
  ArrowRight, Building2, Edit, MessageCircle, Calendar,
  Star, Activity, Zap, Award, Bell, ChevronRight, Loader2,
  PlusCircle, Mail, Phone, MapPin, Globe, BarChart3,
  Target, Rocket, Sparkles, ThumbsUp, MessageSquare,
  Download, FileText, Eye, DollarSign
} from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TeamActivity } from "@/components/dashboard/TeamActivity"
import { RemindersWidget } from "@/components/dashboard/RemindersWidget"
import { RecentMessages } from "@/components/dashboard/RecentMessages"

interface DashboardData {
  company: {
    id: string
    name: string
    status: string
    profileComplete: number
    fieldOfExpertise: string
    description: string
    website?: string
    email?: string
    phone?: string
    location?: string
    logo?: string
  }
  stats: {
    totalEngagements: number
    activeEngagements: number
    completedEngagements: number
    proposalEngagements: number
    totalServices: number
    totalClients: number
    responseRate: number
    avgResponseTime: string
    satisfactionScore: number
    monthlyGrowth: number
    totalRevenue: number
    pendingRevenue: number
  }
  engagementTrend: Array<{
    month: string
    engagements: number
    completed: number
    revenue: number
  }>
  serviceDistribution: Array<{
    name: string
    value: number
    color: string
  }>
  recentActivities: Array<{
    id: string
    type: string
    title: string
    timestamp: string
    status?: string
    clientName?: string
  }>
  pendingTasks: Array<{
    id: string
    title: string
    priority: "high" | "medium" | "low"
    action?: string
    actionLink?: string
  }>
  insights: Array<{
    id: string
    title: string
    description: string
    icon: string
    action?: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function EnhancedCompanyDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")

    if (status === "unauthenticated") {
      router.push("/auth/login")
    }

    const fetchDashboardData = async () => {
      try {
        const companyRes = await fetch("/api/company/profile")
        const companyData = await companyRes.json()
        const engagementsRes = await fetch("/api/engagements")
        const engagementsData = await engagementsRes.json()

        if (companyData.success && engagementsData.success) {
          const company = companyData.company
          const engagements = engagementsData.engagements || []

          const profileFields = [company.name, company.description, company.fieldOfExpertise]
          const profileComplete = Math.round((profileFields.filter(Boolean).length / 3) * 100)
          const totalRevenue = engagements.reduce((sum: number, e: any) => sum + (e.dealValue || 0), 0)
          const pendingRevenue = engagements
            .filter((e: any) => e.stage === "PROPOSAL" || e.stage === "ACTIVE")
            .reduce((sum: number, e: any) => sum + (e.dealValue || 0), 0)

          const engagementTrend = [
            { month: "Jan", engagements: 2, completed: 1, revenue: 5000 },
            { month: "Feb", engagements: 3, completed: 1, revenue: 7500 },
            { month: "Mar", engagements: 4, completed: 2, revenue: 12000 },
            { month: "Apr", engagements: 3, completed: 1, revenue: 8000 },
            { month: "May", engagements: 5, completed: 2, revenue: 15000 },
            { month: "Jun", engagements: 4, completed: 3, revenue: 18000 },
          ]

          const serviceDistribution = (company.services || []).map((s: any, i: number) => ({
            name: s.title.length > 15 ? s.title.substring(0, 15) + "..." : s.title,
            value: Math.floor(Math.random() * 40) + 10,
            color: COLORS[i % COLORS.length]
          }))

          setData({
            company: {
              id: company.id,
              name: company.name,
              status: company.status,
              profileComplete,
              fieldOfExpertise: company.fieldOfExpertise || "",
              description: company.description || "",
              website: company.website,
              email: company.email,
              phone: company.phone,
              location: company.location,
              logo: company.logo
            },
            stats: {
              totalEngagements: engagements.length,
              activeEngagements: engagements.filter((e: any) => e.stage === "ACTIVE").length,
              completedEngagements: engagements.filter((e: any) => e.stage === "COMPLETED").length,
              proposalEngagements: engagements.filter((e: any) => e.stage === "PROPOSAL").length,
              totalServices: company.services?.length || 0,
              totalClients: [...new Set(engagements.map((e: any) => e.clientId))].length,
              responseRate: 94,
              avgResponseTime: "2.5 hours",
              satisfactionScore: 4.8,
              monthlyGrowth: 12,
              totalRevenue,
              pendingRevenue
            },
            engagementTrend,
            serviceDistribution: serviceDistribution.length > 0 ? serviceDistribution : [
              { name: "No services yet", value: 100, color: "#CBD5E1" }
            ],
            recentActivities: engagements.slice(0, 5).map((e: any) => ({
              id: e.id,
              type: e.stage,
              title: `Engagement ${e.stage.toLowerCase()} with ${e.client?.companyName || "a client"}`,
              timestamp: new Date(e.startedAt).toLocaleDateString(),
              status: e.stage,
              clientName: e.client?.companyName
            })),
            pendingTasks: [
              { id: "1", title: "Complete your company profile", priority: "high", action: "Complete Now", actionLink: "/portal/company/profile" },
              { id: "2", title: "Add more services to attract clients", priority: "medium", action: "Add Services", actionLink: "/portal/company/services" },
              { id: "3", title: "Review pending engagements", priority: "high", action: "View", actionLink: "/portal/engagements" },
            ],
            insights: [
              { id: "1", title: "Profile Optimization", description: "Complete your profile to appear in more searches", icon: "Target", action: "Update Profile" },
              { id: "2", title: "Service Expansion", description: "Companies with 5+ services get 2x more engagements", icon: "Rocket", action: "Add Services" },
              { id: "3", title: "Response Time", description: "Respond within 1 hour to increase conversion by 40%", icon: "ThumbsUp", action: "View Messages" },
            ]
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

  const handleExport = () => {
    if (!data) return
    const exportData = {
      company: data.company.name,
      period: timeRange,
      stats: data.stats,
      engagements: data.engagementTrend,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }

  if (status === "loading" || loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white relative overflow-hidden">
        <div className="relative px-4 py-8 md:px-6">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">
                {greeting}, {session?.user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-teal-100 mt-1">
                Welcome back to your {data.company.name} dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              <Link
                href="/portal/company/profile"
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium flex items-center gap-2 backdrop-blur-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">↑ {data.stats.monthlyGrowth}%</span>
            </div>
            <p className="text-2xl font-bold text-navy-900">{data.stats.totalEngagements}</p>
            <p className="text-xs text-slate-500 mt-1">Total Engagements</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">${data.stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Total Revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">${data.stats.pendingRevenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Pending Revenue</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mb-2">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">{data.stats.satisfactionScore} / 5.0</p>
            <p className="text-xs text-slate-500 mt-1">Client Satisfaction</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-navy-900">Engagement & Revenue Trend</h3>
              <div className="flex gap-2">
                <button onClick={() => setTimeRange("week")} className={`px-2 py-1 text-xs rounded ${timeRange === "week" ? "bg-teal-600 text-white" : "bg-slate-100"}`}>Week</button>
                <button onClick={() => setTimeRange("month")} className={`px-2 py-1 text-xs rounded ${timeRange === "month" ? "bg-teal-600 text-white" : "bg-slate-100"}`}>Month</button>
                <button onClick={() => setTimeRange("year")} className={`px-2 py-1 text-xs rounded ${timeRange === "year" ? "bg-teal-600 text-white" : "bg-slate-100"}`}>Year</button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Area yAxisId="left" type="monotone" dataKey="engagements" stackId="1" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                <Area yAxisId="left" type="monotone" dataKey="completed" stackId="1" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FFBB28" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Service Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.serviceDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {data.serviceDistribution.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Engagement Pipeline</h3>
            <div className="space-y-3">
              <div><div className="flex justify-between text-sm mb-1"><span>Proposal ({data.stats.proposalEngagements})</span><span>{Math.round((data.stats.proposalEngagements / data.stats.totalEngagements) * 100) || 0}%</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-amber-500 rounded-full h-2" style={{ width: `${(data.stats.proposalEngagements / data.stats.totalEngagements) * 100 || 0}%` }} /></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Active ({data.stats.activeEngagements})</span><span>{Math.round((data.stats.activeEngagements / data.stats.totalEngagements) * 100) || 0}%</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-green-500 rounded-full h-2" style={{ width: `${(data.stats.activeEngagements / data.stats.totalEngagements) * 100 || 0}%` }} /></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Completed ({data.stats.completedEngagements})</span><span>{Math.round((data.stats.completedEngagements / data.stats.totalEngagements) * 100) || 0}%</span></div><div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-teal-500 rounded-full h-2" style={{ width: `${(data.stats.completedEngagements / data.stats.totalEngagements) * 100 || 0}%` }} /></div></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4">Recent Activity</h3>
            {data.recentActivities.slice(0, 3).map((a) => (<div key={a.id} className="flex items-start gap-2 mb-2"><div className={`w-2 h-2 rounded-full mt-1.5 ${a.status === "ACTIVE" ? "bg-green-500" : a.status === "PROPOSAL" ? "bg-amber-500" : "bg-teal-500"}`} /><div><p className="text-xs text-slate-700">{a.title}</p><p className="text-xs text-slate-400">{a.timestamp}</p></div></div>))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-teal-600" />Insights</h3>
            {data.insights.slice(0, 2).map((i) => (<div key={i.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg mb-2"><div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">{i.icon === "Target" ? <Target className="w-3 h-3 text-teal-600" /> : <Rocket className="w-3 h-3 text-teal-600" />}</div><div><p className="text-xs font-medium">{i.title}</p><p className="text-xs text-slate-500">{i.description}</p></div></div>))}
          </div>
        </div>

        {/* Team Activity & Reminders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              Team Activity
            </h3>
            <TeamActivity />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <RemindersWidget />
          </div>
        </div>

        {/* Recent Messages */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <RecentMessages />
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Export Dashboard Report</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Report Period</label><select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg"><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="year">Last 12 months</option></select></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1">Format</label><select className="w-full px-3 py-2 border border-slate-200 rounded-lg"><option>JSON</option><option disabled>CSV (Coming soon)</option></select></div>
              <div className="flex gap-3 pt-4"><button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button><button onClick={handleExport} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Export</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
