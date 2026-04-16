"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Building2, Clock, CheckCircle, XCircle, Calendar, 
  Eye, FileText, Upload, Mail, Phone, MapPin, Globe,
  Loader2, Search, RefreshCw, ChevronRight, AlertCircle,
  Video, MapPin as MapPinIcon, Calendar as CalendarIcon
} from "lucide-react"
import Link from "next/link"

interface VerificationRequest {
  id: string
  company: {
    id: string
    name: string
    slug: string
    description: string | null
    fieldOfExpertise: string | null
    website: string | null
    phone: string | null
    location: string | null
    email: string | null
    users: Array<{ name: string; email: string }>
  }
  businessCertUrl: string | null
  taxComplianceUrl: string | null
  professionalLicenseUrl: string | null
  insuranceUrl: string | null
  portfolioUrls: string[]
  verificationStatus: string
  interviewDate: string | null
  interviewLocation: string | null
  interviewNotes: string | null
  interviewType: string | null
  createdAt: string
}

export default function AdminVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [interviewData, setInterviewData] = useState({
    date: "",
    time: "",
    location: "",
    type: "IN_PERSON"
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      router.push("/portal/client/dashboard")
    }
    fetchRequests()
  }, [status, session, router])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/verification")
      const data = await res.json()
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (error) {
      console.error("Failed to fetch verification requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (companyId: string, status: string, interviewData?: any) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/verification/${companyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status,
          interviewDate: interviewData?.date ? new Date(`${interviewData.date}T${interviewData.time}`).toISOString() : undefined,
          interviewLocation: interviewData?.location,
          interviewType: interviewData?.type,
          rejectionReason: rejectReason
        })
      })
      if (res.ok) {
        fetchRequests()
        setShowInterviewModal(false)
        setShowRejectModal(false)
        setRejectReason("")
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "DOCUMENTS_SUBMITTED": return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"><Upload className="w-3 h-3" /> Documents Submitted</span>
      case "INTERVIEW_SCHEDULED": return <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"><Calendar className="w-3 h-3" /> Interview Scheduled</span>
      case "INTERVIEW_COMPLETED": return <span className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Interview Completed</span>
      case "APPROVED": return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Approved</span>
      case "REJECTED": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Rejected</span>
      default: return <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> {status}</span>
    }
  }

  const filteredRequests = requests.filter(req =>
    req.company.name.toLowerCase().includes(search.toLowerCase()) ||
    req.company.users[0]?.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Company Verification</h1>
          <p className="text-white/80 mt-1 text-sm">Review and verify company registrations</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Upload className="w-4 h-4 text-blue-500" />
              Pending Review
            </div>
            <p className="text-2xl font-bold text-navy-900">{requests.filter(r => r.verificationStatus === "DOCUMENTS_SUBMITTED").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Calendar className="w-4 h-4 text-purple-500" />
              Interviews Scheduled
            </div>
            <p className="text-2xl font-bold text-navy-900">{requests.filter(r => r.verificationStatus === "INTERVIEW_SCHEDULED").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Approved
            </div>
            <p className="text-2xl font-bold text-navy-900">{requests.filter(r => r.verificationStatus === "APPROVED").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              Total Applications
            </div>
            <p className="text-2xl font-bold text-navy-900">{requests.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button onClick={fetchRequests} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Verification Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-xl border p-5 hover:shadow-md transition cursor-pointer ${
                selectedRequest?.id === req.id ? "border-teal-500 bg-teal-50/20 ring-2 ring-teal-500" : "border-slate-200"
              }`}
              onClick={() => setSelectedRequest(req)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{req.company.name}</h3>
                    <p className="text-sm text-slate-500">{req.company.fieldOfExpertise || "General"}</p>
                    <p className="text-xs text-slate-400 mt-1">{req.company.users[0]?.email}</p>
                  </div>
                </div>
                {getStatusBadge(req.verificationStatus)}
              </div>
              
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                {req.interviewDate && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Interview: {new Date(req.interviewDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Request Details */}
        {selectedRequest && (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-navy-900">{selectedRequest.company.name}</h3>
              <div className="flex gap-2">
                {selectedRequest.verificationStatus === "DOCUMENTS_SUBMITTED" && (
                  <>
                    <button
                      onClick={() => setShowInterviewModal(true)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
                    >
                      Schedule Interview
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition"
                    >
                      Reject
                    </button>
                  </>
                )}
                {selectedRequest.verificationStatus === "INTERVIEW_COMPLETED" && (
                  <button
                    onClick={() => updateStatus(selectedRequest.company.id, "APPROVED")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                  >
                    Approve Company
                  </button>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  {selectedRequest.company.users[0]?.name && <p><span className="text-slate-500">Rep:</span> {selectedRequest.company.users[0].name}</p>}
                  <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {selectedRequest.company.users[0]?.email}</p>
                  {selectedRequest.company.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /> {selectedRequest.company.phone}</p>}
                  {selectedRequest.company.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedRequest.company.location}</p>}
                  {selectedRequest.company.website && <p className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> {selectedRequest.company.website}</p>}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 mb-2">Business Details</h4>
                <p className="text-sm"><span className="text-slate-500">Description:</span> {selectedRequest.company.description || "—"}</p>
              </div>
            </div>

            {/* Documents */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-700 mb-3">Verification Documents</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedRequest.businessCertUrl && (
                  <a href={selectedRequest.businessCertUrl} target="_blank" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">Business Cert</span>
                  </a>
                )}
                {selectedRequest.taxComplianceUrl && (
                  <a href={selectedRequest.taxComplianceUrl} target="_blank" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">Tax Compliance</span>
                  </a>
                )}
                {selectedRequest.professionalLicenseUrl && (
                  <a href={selectedRequest.professionalLicenseUrl} target="_blank" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">License</span>
                  </a>
                )}
                {selectedRequest.portfolioUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <Upload className="w-4 h-4 text-teal-600" />
                    <span className="text-sm">Portfolio {i + 1}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Interview Notes if available */}
            {selectedRequest.interviewNotes && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-2">Interview Notes</h4>
                <p className="text-sm">{selectedRequest.interviewNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Schedule Interview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Interview Type</label>
                <select
                  value={interviewData.type}
                  onChange={(e) => setInterviewData({ ...interviewData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="IN_PERSON">In Person</option>
                  <option value="VIDEO">Video Call</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Meeting Link</label>
                <input
                  type="text"
                  placeholder={interviewData.type === "IN_PERSON" ? "Office address" : "Zoom/Google Meet link"}
                  value={interviewData.location}
                  onChange={(e) => setInterviewData({ ...interviewData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowInterviewModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button
                  onClick={() => updateStatus(selectedRequest.company.id, "INTERVIEW_SCHEDULED", interviewData)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Reject Application</h3>
            <textarea
              rows={4}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
              <button
                onClick={() => updateStatus(selectedRequest.company.id, "REJECTED")}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
