"use client"

import { useState, useEffect } from "react"
import {
  Building2, Mail, Phone, MapPin, Globe, Users, Calendar,
  Briefcase, CheckCircle, XCircle, Clock, Edit2, Save, X,
  TrendingUp, Star, DollarSign, Award, Target, AlertCircle,
  MessageSquare, Send, BarChart3, Activity
} from "lucide-react"
import { Modal } from "@/components/ui/Modal"

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
  updatedAt: string
  _count?: {
    users: number
    engagements: number
    services: number
  }
  users?: Array<{ id: string; name: string; email: string; role: string }>
  services?: Array<{ id: string; title: string; description: string; pricing: string }>
  engagements?: Array<{ stage: string; dealValue: number; client: { companyName: string } }>
}

interface CompanyDetailModalProps {
  isOpen: boolean
  onClose: () => void
  companyId: string | null
  onStatusUpdate?: () => void
}

export function CompanyDetailModal({ isOpen, onClose, companyId, onStatusUpdate }: CompanyDetailModalProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "performance" | "engagements" | "team">("overview")
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    fieldOfExpertise: "",
    website: "",
    email: "",
    phone: "",
    location: ""
  })

  useEffect(() => {
    if (companyId && isOpen) {
      fetchCompanyDetails()
    }
  }, [companyId, isOpen])

  const fetchCompanyDetails = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`)
      const data = await res.json()
      if (data.company) {
        setCompany(data.company)
        setEditForm({
          name: data.company.name || "",
          description: data.company.description || "",
          fieldOfExpertise: data.company.fieldOfExpertise || "",
          website: data.company.website || "",
          email: data.company.email || "",
          phone: data.company.phone || "",
          location: data.company.location || ""
        })
      }
    } catch (error) {
      console.error("Failed to fetch company details:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!company) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setCompany({ ...company, status: newStatus })
        onStatusUpdate?.()
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  const updateCompany = async () => {
    if (!company) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/companies/${company.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setCompany({ ...company, ...editForm })
        setIsEditing(false)
        onStatusUpdate?.()
      }
    } catch (error) {
      console.error("Failed to update company:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "ACTIVE": return <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full"><CheckCircle className="w-4 h-4" /> Active</span>
      case "PENDING": return <span className="inline-flex items-center gap-1 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> Pending</span>
      case "SUSPENDED": return <span className="inline-flex items-center gap-1 text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full"><XCircle className="w-4 h-4" /> Suspended</span>
      default: return <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{status}</span>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  // Calculate performance metrics
  const totalEngagements = company?._count?.engagements || 0
  const completedEngagements = company?.engagements?.filter(e => e.stage === "COMPLETED").length || 0
  const completionRate = totalEngagements > 0 ? Math.round((completedEngagements / totalEngagements) * 100) : 0
  const totalRevenue = company?.engagements?.reduce((sum, e) => sum + (e.dealValue || 0), 0) || 0
  const activeEngagements = company?.engagements?.filter(e => e.stage === "ACTIVE").length || 0

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "engagements", label: "Engagements", icon: Briefcase },
    { id: "team", label: "Team", icon: Users },
  ]

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Details" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : !company ? (
        <div className="text-center py-12 text-slate-500">Company not found</div>
      ) : (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <Building2 className="w-7 h-7 text-purple-600" />
                )}
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
                  <h3 className="text-xl font-semibold text-navy-900">{company.name}</h3>
                )}
                <p className="text-sm text-slate-500 mt-0.5">Slug: {company.slug}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {getStatusBadge(company.status)}
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
                  <button onClick={updateCompany} disabled={updating} className="px-3 py-1 text-sm bg-teal-600 text-white rounded-lg">Save</button>
                </>
              )}
            </div>
          </div>

          {/* Status Actions */}
          {company.status === "PENDING" && (
            <div className="flex gap-2">
              <button onClick={() => updateStatus("ACTIVE")} disabled={updating} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg">Approve Company</button>
              <button onClick={() => updateStatus("SUSPENDED")} disabled={updating} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg">Reject</button>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <div className="flex gap-4">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-2 px-1 text-sm font-medium transition flex items-center gap-2 ${
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

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Contact Information</h4>
                  {company.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400" />{company.email}</div>}
                  {company.phone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" />{company.phone}</div>}
                  {company.location && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400" />{company.location}</div>}
                  {company.website && <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-slate-400" /><a href={company.website} target="_blank" className="text-teal-600">{company.website}</a></div>}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">Business Details</h4>
                  <div><p className="text-xs text-slate-500">Field of Expertise</p><p className="text-sm">{company.fieldOfExpertise || "Not specified"}</p></div>
                  <div><p className="text-xs text-slate-500">Joined</p><p className="text-sm">{new Date(company.createdAt).toLocaleDateString()}</p></div>
                </div>
              </div>
              {company.description && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
                  <p className="text-sm text-slate-600">{company.description}</p>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <div className="text-center p-2 bg-slate-50 rounded-lg"><Users className="w-4 h-4 mx-auto text-slate-400" /><p className="text-lg font-semibold">{company._count?.users || 0}</p><p className="text-xs text-slate-500">Team</p></div>
                <div className="text-center p-2 bg-slate-50 rounded-lg"><Briefcase className="w-4 h-4 mx-auto text-slate-400" /><p className="text-lg font-semibold">{company._count?.engagements || 0}</p><p className="text-xs text-slate-500">Engagements</p></div>
                <div className="text-center p-2 bg-slate-50 rounded-lg"><Building2 className="w-4 h-4 mx-auto text-slate-400" /><p className="text-lg font-semibold">{company._count?.services || 0}</p><p className="text-xs text-slate-500">Services</p></div>
                <div className="text-center p-2 bg-slate-50 rounded-lg"><DollarSign className="w-4 h-4 mx-auto text-slate-400" /><p className="text-lg font-semibold">{formatCurrency(totalRevenue)}</p><p className="text-xs text-slate-500">Revenue</p></div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === "performance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 mx-auto text-green-600 mb-1" />
                  <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
                  <p className="text-xs text-slate-600">Completion Rate</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Target className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{activeEngagements}</p>
                  <p className="text-xs text-slate-600">Active Deals</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg text-center">
                  <Star className="w-5 h-5 mx-auto text-amber-600 mb-1" />
                  <p className="text-2xl font-bold text-amber-600">4.8</p>
                  <p className="text-xs text-slate-600">Client Rating</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <Clock className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                  <p className="text-2xl font-bold text-purple-600">2.4h</p>
                  <p className="text-xs text-slate-600">Avg Response</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Performance Insights</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Total Engagements</span><span className="font-semibold">{totalEngagements}</span></div>
                  <div className="flex justify-between"><span>Completed Engagements</span><span className="font-semibold">{completedEngagements}</span></div>
                  <div className="flex justify-between"><span>Total Revenue Generated</span><span className="font-semibold text-teal-600">{formatCurrency(totalRevenue)}</span></div>
                  {company._count?.services && <div className="flex justify-between"><span>Services Offered</span><span className="font-semibold">{company._count.services}</span></div>}
                </div>
              </div>
            </div>
          )}

          {/* Engagements Tab */}
          {activeTab === "engagements" && (
            <div>
              {company.engagements && company.engagements.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {company.engagements.map((eng, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{eng.client.companyName}</p>
                        <p className="text-xs text-slate-500">Deal Value: {formatCurrency(eng.dealValue || 0)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        eng.stage === "ACTIVE" ? "bg-green-100 text-green-700" :
                        eng.stage === "COMPLETED" ? "bg-teal-100 text-teal-700" :
                        eng.stage === "PROPOSAL" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>{eng.stage}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">No engagements yet</div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div>
              {company.users && company.users.length > 0 ? (
                <div className="space-y-2">
                  {company.users.map(user => (
                    <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-xs font-semibold text-teal-600">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{user.name || "Unnamed"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-xs text-slate-400">{user.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">No team members yet</div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
