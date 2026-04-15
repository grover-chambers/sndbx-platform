"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Search, RefreshCw, Eye, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertCircle, Briefcase, Users,
  Building2, DollarSign, Calendar, Filter, X,
  ChevronLeft, ChevronRight, BarChart3, Target,
  FileText, Archive, PieChart
} from "lucide-react"
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'
import { EngagementDetailModal } from "@/components/admin/EngagementDetailModal"

interface Engagement {
  id: string
  stage: string
  dealValue: number | null
  notes: string | null
  startedAt: string
  completedAt: string | null
  createdAt: string
  client: { id: string; companyName: string; industry: string }
  company: { id: string; name: string; fieldOfExpertise: string }
  matcher: { name: string; email: string } | null
  timeline: Array<{ id: string; stage: string; note: string; createdAt: string }>
}

interface Analytics {
  total: number
  active: number
  completed: number
  completionRate: number
  stalled: number
  totalValue: number
  byStage: Array<{ stage: string; count: number }>
  stageDurations: Record<string, number>
  monthlyTrend: Array<{ month: string; engagements: number; value: number; completed: number }>
  topCompanies: Array<{ id: string; name: string; completedEngagements: number }>
  topClients: Array<{ id: string; name: string; totalEngagements: number }>
}

const stageColors: Record<string, string> = {
  MATCHED: "bg-blue-100 text-blue-700",
  PROPOSAL: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  ARCHIVED: "bg-slate-100 text-slate-600"
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminEngagements() {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stage, setStage] = useState("")
  const [page, setPage] = useState(1)
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchEngagements = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    if (stage) params.set("stage", stage)
    
    try {
      const res = await fetch(`/api/admin/engagements?${params}`)
      const data = await res.json()
      if (data.engagements) {
        setEngagements(data.engagements || [])
        setAnalytics(data.analytics)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error("Failed to fetch engagements:", error)
    } finally {
      setLoading(false)
    }
  }, [search, stage, page])

  useEffect(() => { fetchEngagements() }, [fetchEngagements])

  const handleViewDetails = (id: string) => {
    setSelectedEngagementId(id)
    setModalOpen(true)
  }

  const getStageBadge = (stage: string) => {
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${stageColors[stage] || "bg-slate-100 text-slate-600"}`}>
        {stage}
      </span>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Engagements</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor client-company relationships and deal pipeline</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  Total
                </div>
                <p className="text-2xl font-bold text-navy-900">{analytics.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Active Deals
                </div>
                <p className="text-2xl font-bold text-navy-900">{analytics.active}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  Completion Rate
                </div>
                <p className="text-2xl font-bold text-navy-900">{analytics.completionRate}%</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  Total Value
                </div>
                <p className="text-2xl font-bold text-navy-900">{formatCurrency(analytics.totalValue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Stalled
                </div>
                <p className="text-2xl font-bold text-navy-900">{analytics.stalled}</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Monthly Trend Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Engagement Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="engagements" stroke="#0088FE" fill="#0088FE" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="completed" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stage Distribution Pie Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-teal-600" />
                  Stage Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RePieChart>
                    <Pie
                      data={analytics.byStage}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="stage"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.byStage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Top Performing Companies
                </h3>
                <div className="space-y-3">
                  {analytics.topCompanies.map((company, i) => (
                    <div key={company.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">#{i+1}</span>
                        <span className="text-sm font-medium text-slate-700">{company.name}</span>
                      </div>
                      <span className="text-sm text-teal-600 font-semibold">{company.completedEngagements} completed</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Most Active Clients
                </h3>
                <div className="space-y-3">
                  {analytics.topClients.map((client, i) => (
                    <div key={client.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">#{i+1}</span>
                        <span className="text-sm font-medium text-slate-700">{client.name}</span>
                      </div>
                      <span className="text-sm text-blue-600 font-semibold">{client.totalEngagements} engagements</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client or company..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={stage}
            onChange={e => { setStage(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Stages</option>
            <option value="MATCHED">Matched</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button onClick={() => fetchEngagements()} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Stalled Alert */}
        {analytics && analytics.stalled > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Stalled Engagements Detected</p>
                <p className="text-xs text-red-600">{analytics.stalled} engagements with no activity for 14+ days</p>
              </div>
            </div>
          </div>
        )}

        {/* Engagements Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Stage</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Deal Value</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Started</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Age</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : engagements.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No engagements found</td></tr>
                ) : (
                  engagements.map(eng => {
                    const age = Math.ceil((new Date().getTime() - new Date(eng.createdAt).getTime()) / (1000 * 60 * 60 * 24))
                    const isStalled = age > 14 && ["MATCHED", "PROPOSAL", "ACTIVE"].includes(eng.stage)
                    
                    return (
                      <tr key={eng.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">{eng.client.companyName}</p>
                          <p className="text-xs text-slate-400">{eng.client.industry || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-slate-900">{eng.company.name}</p>
                          <p className="text-xs text-slate-400">{eng.company.fieldOfExpertise || "—"}</p>
                        </td>
                        <td className="px-5 py-3.5">{getStageBadge(eng.stage)}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {eng.dealValue ? formatCurrency(eng.dealValue) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{new Date(eng.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5">
                          <span className={isStalled ? "text-red-600 font-medium" : "text-slate-500"}>
                            {age} days
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleViewDetails(eng.id)}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {total > 20 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p-1)} className="text-xs px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Previous</button>
                <button disabled={page*20 >= total} onClick={() => setPage(p => p+1)} className="text-xs px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EngagementDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedEngagementId(null)
        }}
        engagementId={selectedEngagementId}
        onUpdate={fetchEngagements}
      />
    </>
  )
}
