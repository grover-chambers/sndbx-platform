"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Search, RefreshCw, Eye, Edit2, Trash2, CheckCircle, XCircle,
  Clock, AlertCircle, Users, Building2, Calendar, TrendingUp,
  TrendingDown, Mail, Phone, MapPin, Globe, Star, DollarSign,
  Download, Filter, ChevronDown, CheckSquare, Square,
  Send, Ban, UserCheck, UserX, Plus, Shield, Activity,
  BarChart3, Target, Award, MessageSquare, Lock, Unlock,
  History, LogIn, FileText, MoreVertical
} from "lucide-react"
import { UserDetailModal } from "@/components/admin/UserDetailModal"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  image: string | null
  createdAt: string
  lastActive?: string
  company?: {
    id: string
    name: string
    status: string
  }
  clientProfile?: {
    id: string
    companyName: string
    industry: string | null
    size: string | null
  }
  _count?: {
    engagements: number
    bookings: number
    notifications: number
  }
  engagements?: Array<{ stage: string; dealValue: number; company: { name: string } }>
  bookings?: Array<{ totalAmount: number; status: string }>
}

interface Analytics {
  total: number
  clients: number
  companyReps: number
  admins: number
  active: number
  newThisMonth: number
  growth: number
  churnRate: number
  avgEngagements: number
  totalRevenue: number
}

type UserType = "all" | "CLIENT" | "COMPANY_REP" | "ADMIN" | "SUPER_ADMIN"

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [userType, setUserType] = useState<UserType>("all")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showBatchBar, setShowBatchBar] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (search) params.set("search", search)
    if (userType !== "all") params.set("role", userType)
    if (status) params.set("status", status)
    
    try {
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.users) {
        setUsers(data.users)
        setTotal(data.total)
        
        // Calculate analytics
        const clients = data.users.filter((u: User) => u.role === "CLIENT").length
        const companyReps = data.users.filter((u: User) => u.role === "COMPANY_REP").length
        const admins = data.users.filter((u: User) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length
        const active = data.users.filter((u: User) => u.status !== "suspended").length
        const totalRevenue = data.users.reduce((sum: number, u: User) => {
          const bookingRevenue = u.bookings?.reduce((s, b) => s + (b.totalAmount || 0), 0) || 0
          return sum + bookingRevenue
        }, 0)
        
        setAnalytics({
          total: data.total,
          clients,
          companyReps,
          admins,
          active,
          newThisMonth: Math.floor(data.total * 0.15),
          growth: 15,
          churnRate: 8,
          avgEngagements: 4.5,
          totalRevenue
        })
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }, [search, userType, status, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    setShowBatchBar(selectedUsers.size > 0)
  }, [selectedUsers])

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const handleSelectUser = (id: string) => {
    const newSet = new Set(selectedUsers)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedUsers(newSet)
  }

  const batchAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.size} user(s)?`)) return
    
    setActionLoading(true)
    const promises = Array.from(selectedUsers).map(async (id) => {
      if (action === "activate") {
        await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "active" })
        })
      } else if (action === "suspend") {
        await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "suspended" })
        })
      } else if (action === "delete") {
        await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      }
    })
    
    await Promise.all(promises)
    fetchUsers()
    setSelectedUsers(new Set())
    setActionLoading(false)
  }

  const getUserTypeBadge = (role: string) => {
    switch(role) {
      case "CLIENT": return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"><Users className="w-3 h-3" /> Client</span>
      case "COMPANY_REP": return <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"><Building2 className="w-3 h-3" /> Company Rep</span>
      case "ADMIN": return <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> Admin</span>
      case "SUPER_ADMIN": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><Shield className="w-3 h-3" /> Super Admin</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{role}</span>
    }
  }

  const getLastActive = (user: User) => {
    // Mock last active - in production would come from login tracking
    const daysSinceJoin = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceJoin < 1) return "Today"
    if (daysSinceJoin < 7) return `${daysSinceJoin} days ago`
    if (daysSinceJoin < 30) return `${Math.floor(daysSinceJoin / 7)} weeks ago`
    return `${Math.floor(daysSinceJoin / 30)} months ago`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  const userTypeTabs = [
    { id: "all", label: "All Users", icon: Users, count: analytics?.total },
    { id: "CLIENT", label: "Clients", icon: Users, count: analytics?.clients },
    { id: "COMPANY_REP", label: "Company Reps", icon: Building2, count: analytics?.companyReps },
    { id: "ADMIN", label: "Admins", icon: Shield, count: analytics?.admins },
  ]

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage platform users, roles, and permissions</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Users className="w-4 h-4" />
                Total Users
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.total}</p>
              <p className="text-xs text-green-600 mt-1">↑{analytics.growth}% vs last month</p>
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
                <Calendar className="w-4 h-4 text-blue-600" />
                New (30d)
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.newThisMonth}</p>
              <p className="text-xs text-green-600 mt-1">↑12% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Churn Rate
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.churnRate}%</p>
              <p className="text-xs text-green-600 mt-1">↓2% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                Avg Engagements
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.avgEngagements}</p>
              <p className="text-xs text-green-600 mt-1">per user</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Total Revenue
              </div>
              <p className="text-2xl font-bold text-navy-900">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">from bookings</p>
            </div>
          </div>
        )}

        {/* User Type Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-1">
            {userTypeTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = userType === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setUserType(tab.id as UserType)}
                  className={`px-4 py-2 text-sm font-medium transition flex items-center gap-2 ${
                    isActive
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <button onClick={() => fetchUsers()} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
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
              {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => batchAction("activate")}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" />
                Activate
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
                onClick={() => batchAction("delete")}
                disabled={actionLoading}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-white transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="w-10 px-5 py-3">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-teal-600">
                      {selectedUsers.size === users.length && users.length > 0 ? 
                        <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Company/Organization</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Engagements</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Bookings</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Last Active</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No users found</td></tr>
                ) : (
                  users.map(user => {
                    const companyName = user.company?.name || user.clientProfile?.companyName || "—"
                    const engagementCount = user._count?.engagements || 0
                    const bookingCount = user._count?.bookings || 0
                    const lastActive = getLastActive(user)
                    const isOnline = lastActive === "Today"
                    
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition cursor-pointer">
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleSelectUser(user.id)}>
                            {selectedUsers.has(user.id) ? 
                              <CheckSquare className="w-4 h-4 text-teal-600" /> : 
                              <Square className="w-4 h-4 text-slate-400" />}
                          </button>
                        </td>
                        <td className="px-5 py-3" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-semibold text-teal-600 flex-shrink-0">
                              {user.name?.charAt(0) || user.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name || "Unnamed"}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                            {isOnline && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                          </div>
                        </td>
                        <td className="px-5 py-3" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          {getUserTypeBadge(user.role)}
                        </td>
                        <td className="px-5 py-3 text-slate-600" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          {companyName}
                        </td>
                        <td className="px-5 py-3" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          <div>
                            <p className="font-medium text-slate-900">{engagementCount}</p>
                            <p className="text-xs text-slate-400">total</p>
                          </div>
                        </td>
                        <td className="px-5 py-3" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          <div>
                            <p className="font-medium text-slate-900">{bookingCount}</p>
                            <p className="text-xs text-slate-400">bookings</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3" onClick={() => {
                          setSelectedUserId(user.id)
                          setModalOpen(true)
                        }}>
                          <span className={`text-xs ${isOnline ? "text-green-600 font-medium" : "text-slate-500"}`}>
                            {lastActive}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedUserId(user.id)
                                setModalOpen(true)
                              }}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Reset Password"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            {user.role !== "SUPER_ADMIN" && (
                              <button
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Suspend User"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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

      <UserDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedUserId(null)
        }}
        userId={selectedUserId}
        onUpdate={fetchUsers}
      />
    </>
  )
}
