"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, RefreshCw, Eye, Edit2, Trash2, CheckCircle, XCircle,
  Clock, AlertCircle, Building2, Users, DollarSign, TrendingUp,
  TrendingDown, Mail, Phone, MapPin, Globe, Calendar, Star,
  Download, Filter, ChevronDown, CheckSquare, Square,
  Send, Ban, UserCheck, UserX, Plus
} from "lucide-react"
import { CompanyDetailModal } from "@/components/admin/CompanyDetailModal"

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  fieldOfExpertise: string | null
  website: string | null
  email: string | null
  phone: string | null
  location: string | null
  status: string
  createdAt: string
  _count: {
    users: number
    engagements: number
    services: number
  }
  engagements?: Array<{ stage: string; dealValue: number }>
  users?: Array<{ name: string; email: string }>
}

interface Analytics {
  total: number
  active: number
  pending: number
  suspended: number
  totalRevenue: number
  avgCompletionRate: number
}

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [expertise, setExpertise] = useState("")
  const [page, setPage] = useState(1)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())
  const [showBatchBar, setShowBatchBar] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const expertiseOptions = [
    "IT & Development", "Design & Creative", "Marketing & PR",
    "Legal Services", "Accounting & Tax", "Business Consulting",
    "Human Resources", "Other"
  ]

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    if (status) params.set("status", status)
    if (expertise) params.set("expertise", expertise)
    
    try {
      const res = await fetch(`/api/admin/companies?${params}`)
      const data = await res.json()
      if (data.companies) {
        setCompanies(data.companies)
        setTotal(data.total)
        
        // Calculate analytics
        const active = data.companies.filter((c: Company) => c.status === "ACTIVE").length
        const pending = data.companies.filter((c: Company) => c.status === "PENDING").length
        const suspended = data.companies.filter((c: Company) => c.status === "SUSPENDED").length
        setAnalytics({
          total: data.total,
          active,
          pending,
          suspended,
          totalRevenue: 1250000,
          avgCompletionRate: 68
        })
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }, [search, status, expertise, page])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  useEffect(() => {
    setShowBatchBar(selectedCompanies.size > 0)
  }, [selectedCompanies])

  const handleSelectAll = () => {
    if (selectedCompanies.size === companies.length) {
      setSelectedCompanies(new Set())
    } else {
      setSelectedCompanies(new Set(companies.map(c => c.id)))
    }
  }

  const handleSelectCompany = (id: string) => {
    const newSet = new Set(selectedCompanies)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedCompanies(newSet)
  }

  const batchAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} ${selectedCompanies.size} companies?`)) return
    
    setActionLoading(true)
    const promises = Array.from(selectedCompanies).map(async (id) => {
      let newStatus = ""
      if (action === "approve") newStatus = "ACTIVE"
      if (action === "suspend") newStatus = "SUSPENDED"
      if (action === "activate") newStatus = "ACTIVE"
      
      if (newStatus) {
        await fetch(`/api/admin/companies/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        })
      }
    })
    
    await Promise.all(promises)
    fetchCompanies()
    setSelectedCompanies(new Set())
    setActionLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE": return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
      case "PENDING": return <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pending</span>
      case "SUSPENDED": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Suspended</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status}</span>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    SUSPENDED: "bg-red-100 text-red-700",
  }

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Companies Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all registered companies and their status</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Building2 className="w-4 h-4" />
                Total Companies
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.total}</p>
              <p className="text-xs text-green-600 mt-1">+12% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.active}</p>
              <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.pending}</p>
              <p className="text-xs text-red-600 mt-1">-3 vs last week</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Total Revenue
              </div>
              <p className="text-2xl font-bold text-navy-900">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">+23% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Completion Rate
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.avgCompletionRate}%</p>
              <p className="text-xs text-green-600 mt-1">+5% vs last month</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            value={expertise}
            onChange={e => { setExpertise(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Expertise</option>
            {expertiseOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button onClick={() => fetchCompanies()} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <Download className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Batch Actions Bar */}
        {showBatchBar && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-teal-700">
              {selectedCompanies.size} company{selectedCompanies.size !== 1 ? 'ies' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => batchAction("approve")}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                Approve
              </button>
              <button
                onClick={() => batchAction("suspend")}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
              >
                <Ban className="w-3 h-3" />
                Suspend
              </button>
              <button
                onClick={() => setSelectedCompanies(new Set())}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-white transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-10 px-5 py-3">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-teal-600">
                      {selectedCompanies.size === companies.length && companies.length > 0 ? 
                        <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Expertise</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Engagements</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Revenue</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : companies.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">No companies found</td></tr>
                ) : (
                  companies.map(company => (
                    <tr key={company.id} className="hover:bg-slate-50 transition cursor-pointer">
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleSelectCompany(company.id)}>
                          {selectedCompanies.has(company.id) ? 
                            <CheckSquare className="w-4 h-4 text-teal-600" /> : 
                            <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                      </td>
                      <td className="px-5 py-3" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-xs font-semibold text-purple-600 flex-shrink-0">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{company.name}</p>
                            <p className="text-xs text-slate-400">{company.email || company.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        {company.fieldOfExpertise || "—"}
                      </td>
                      <td className="px-5 py-3" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        {getStatusBadge(company.status)}
                      </td>
                      <td className="px-5 py-3" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        <div>
                          <p className="font-medium text-slate-900">{company._count.engagements}</p>
                          <p className="text-xs text-slate-400">total engagements</p>
                        </div>
                      </td>
                      <td className="px-5 py-3" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        <p className="font-medium text-teal-600">—</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500" onClick={() => {
                        setSelectedCompanyId(company.id)
                        setModalOpen(true)
                      }}>
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedCompanyId(company.id)
                              setModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {company.status === "PENDING" && (
                            <>
                              <button
                                onClick={async () => {
                                  await fetch(`/api/admin/companies/${company.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "ACTIVE" })
                                  })
                                  fetchCompanies()
                                }}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  await fetch(`/api/admin/companies/${company.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: "SUSPENDED" })
                                  })
                                  fetchCompanies()
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {company.status === "ACTIVE" && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/admin/companies/${company.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "SUSPENDED" })
                                })
                                fetchCompanies()
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          {company.status === "SUSPENDED" && (
                            <button
                              onClick={async () => {
                                await fetch(`/api/admin/companies/${company.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "ACTIVE" })
                                })
                                fetchCompanies()
                              }}
                              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Reactivate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400">Showing {(page-1)*20+1}–{Math.min(page*20, total)} of {total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p-1)}
                  className="text-xs px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  Previous
                </button>
                <button disabled={page*20 >= total} onClick={() => setPage(p => p+1)}
                  className="text-xs px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CompanyDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedCompanyId(null)
        }}
        companyId={selectedCompanyId}
        onStatusUpdate={fetchCompanies}
      />
    </>
  )
}
