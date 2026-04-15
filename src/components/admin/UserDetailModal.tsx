"use client"

import { useState, useEffect } from "react"
import {
  User, Mail, Phone, Building2, Calendar, Clock,
  CheckCircle, XCircle, Edit2, Save, X, Lock,
  Shield, Users, Briefcase, DollarSign, Star,
  TrendingUp, Target, Award, MessageSquare,
  Activity, BarChart3, LogIn, History, FileText,
  Send, Ban, UserCheck, RefreshCw, AlertCircle
} from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  status: string
  image: string | null
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
    status: string
    fieldOfExpertise: string
  }
  clientProfile?: {
    id: string
    companyName: string
    industry: string | null
    size: string | null
  }
  metrics?: {
    totalEngagements: number
    completedEngagements: number
    completionRate: number
    totalSpent: number
    totalBookings: number
  }
  engagements?: Array<{
    id: string
    stage: string
    dealValue: number | null
    startedAt: string
    company: { name: string }
    client: { companyName: string }
  }>
  bookings?: Array<{
    id: string
    startTime: string
    totalAmount: number
    status: string
    space: { name: string }
  }>
}

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onUpdate: () => void
}

export function UserDetailModal({ isOpen, onClose, userId, onUpdate }: UserDetailModalProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"profile" | "activity" | "engagements" | "bookings" | "security">("profile")
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: ""
  })
  const [resetPasswordSent, setResetPasswordSent] = useState(false)

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserDetails()
    }
  }, [userId, isOpen])

  const fetchUserDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setEditForm({
          name: data.user.name || "",
          email: data.user.email,
          role: data.user.role
        })
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async () => {
    if (!user) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setUser({ ...user, ...editForm })
        setIsEditing(false)
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setUpdating(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!user) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setUser({ ...user, status: newStatus })
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const sendPasswordReset = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST"
      })
      if (res.ok) {
        setResetPasswordSent(true)
        setTimeout(() => setResetPasswordSent(false), 3000)
      }
    } catch (error) {
      console.error("Failed to send reset email:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getUserRoleBadge = (role: string) => {
    switch(role) {
      case "CLIENT": return <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Client</span>
      case "COMPANY_REP": return <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Company Representative</span>
      case "ADMIN": return <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Admin</span>
      case "SUPER_ADMIN": return <span className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">Super Admin</span>
      default: return <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{role}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "active" || !status) {
      return <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4" /> Active</span>
    }
    return <span className="inline-flex items-center gap-1 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full"><XCircle className="w-4 h-4" /> Suspended</span>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  const getStageBadge = (stage: string) => {
    switch(stage) {
      case "ACTIVE": return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
      case "COMPLETED": return <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Completed</span>
      case "PROPOSAL": return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Proposal</span>
      case "MATCHED": return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Matched</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{stage}</span>
    }
  }

  const getBookingStatusBadge = (status: string) => {
    switch(status) {
      case "CONFIRMED": return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Confirmed</span>
      case "PENDING": return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
      case "CANCELLED": return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Cancelled</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status}</span>
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "engagements", label: "Engagements", icon: Briefcase },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "security", label: "Security", icon: Shield },
  ]

  if (!isOpen) return null

  // Use metrics from API or calculate from engagements
  const totalEngagements = user?.metrics?.totalEngagements || user?.engagements?.length || 0
  const completedEngagements = user?.metrics?.completedEngagements || user?.engagements?.filter(e => e.stage === "COMPLETED").length || 0
  const completionRate = user?.metrics?.completionRate || (totalEngagements > 0 ? Math.round((completedEngagements / totalEngagements) * 100) : 0)
  const totalSpent = user?.metrics?.totalSpent || user?.bookings?.reduce((sum, b) => sum + b.totalAmount, 0) || 0
  const totalBookings = user?.metrics?.totalBookings || user?.bookings?.length || 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Details" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : !user ? (
        <div className="text-center py-12 text-slate-500">User not found</div>
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-teal-600">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </span>
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-xl font-semibold text-navy-900 border border-slate-200 rounded-lg px-2 py-1"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-navy-900">{user.name || "Unnamed User"}</h3>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {getUserRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm border border-slate-200 rounded-lg">Cancel</button>
                  <button onClick={updateUser} disabled={updating} className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg">Save</button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {user.status !== "suspended" && user.role !== "SUPER_ADMIN" && (
              <button
                onClick={() => updateStatus("suspended")}
                disabled={updating}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-1"
              >
                <Ban className="w-4 h-4" />
                Suspend User
              </button>
            )}
            {user.status === "suspended" && (
              <button
                onClick={() => updateStatus("active")}
                disabled={updating}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-1"
              >
                <UserCheck className="w-4 h-4" />
                Activate User
              </button>
            )}
            <button
              onClick={sendPasswordReset}
              disabled={updating}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Password
            </button>
          </div>

          {resetPasswordSent && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              Password reset email sent to {user.email}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-4 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2 px-1 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Contact Information</h4>
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400" />{user.email}</div>
                  <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-slate-400" />Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                  {user.updatedAt && <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-slate-400" />Last updated: {new Date(user.updatedAt).toLocaleDateString()}</div>}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-700">Organization</h4>
                  {user.company && (
                    <>
                      <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-slate-400" />{user.company.name}</div>
                      <div className="flex items-center gap-2 text-sm"><Target className="w-4 h-4 text-slate-400" />{user.company.fieldOfExpertise || "General"}</div>
                    </>
                  )}
                  {user.clientProfile && (
                    <>
                      <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-slate-400" />{user.clientProfile.companyName}</div>
                      {user.clientProfile.industry && <div className="flex items-center gap-2 text-sm"><Target className="w-4 h-4 text-slate-400" />{user.clientProfile.industry}</div>}
                      {user.clientProfile.size && <div className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-slate-400" />{user.clientProfile.size} employees</div>}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Briefcase className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{totalEngagements}</p>
                  <p className="text-xs text-slate-600">Total Engagements</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                  <p className="text-xs text-slate-600">Completion Rate</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{totalBookings}</p>
                  <p className="text-xs text-slate-600">Total Bookings</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <DollarSign className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(totalSpent)}</p>
                  <p className="text-xs text-slate-600">Total Spent</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg text-center">
                  <Star className="w-5 h-5 mx-auto text-teal-600 mb-1" />
                  <p className="text-lg font-bold text-teal-600">4.8/5</p>
                  <p className="text-xs text-slate-600">Satisfaction Score</p>
                </div>
              </div>
            </div>
          )}

          {/* Engagements Tab */}
          {activeTab === "engagements" && (
            <div>
              {user.engagements && user.engagements.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {user.engagements.map(eng => (
                    <div key={eng.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{eng.company?.name || eng.client?.companyName || "Unknown"}</p>
                        <p className="text-xs text-slate-500">Started: {new Date(eng.startedAt).toLocaleDateString()}</p>
                        {eng.dealValue && <p className="text-xs text-teal-600">Value: {formatCurrency(eng.dealValue)}</p>}
                      </div>
                      {getStageBadge(eng.stage)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">No engagements yet</div>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div>
              {user.bookings && user.bookings.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {user.bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{booking.space?.name || "Unknown Space"}</p>
                        <p className="text-xs text-slate-500">{new Date(booking.startTime).toLocaleString()}</p>
                        <p className="text-xs text-teal-600">{formatCurrency(booking.totalAmount)}</p>
                      </div>
                      {getBookingStatusBadge(booking.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">No bookings yet</div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" /> Account Security</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>User ID</span><span className="font-mono text-xs">{user.id}</span></div>
                  <div className="flex justify-between"><span>Role</span><span>{user.role}</span></div>
                  <div className="flex justify-between"><span>Status</span><span>{user.status || "Active"}</span></div>
                  <div className="flex justify-between"><span>Account Created</span><span>{new Date(user.createdAt).toLocaleString()}</span></div>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Admin Actions</h4>
                <div className="space-y-2">
                  <button className="text-sm text-red-600 hover:underline">Delete Account (Permanent)</button>
                  <div className="text-xs text-amber-700 mt-1">This action cannot be undone</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
