"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, Search, Filter, Users, Star, Briefcase, Clock, MessageCircle, CheckCircle, XCircle, Send, ArrowRight, Loader2, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  fieldOfExpertise: string | null
  location: string | null
  services: Array<{ id: string; title: string }>
  _count: {
    engagements: number
    sentCollaborations: number
    receivedCollaborations: number
  }
}

export default function CollaboratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [expertiseList, setExpertiseList] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("")
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [requestData, setRequestData] = useState({
    message: "",
    projectScope: "",
    timeline: ""
  })
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    if (status === "authenticated" && session?.user?.role !== "COMPANY_REP") {
      router.push("/portal/client/dashboard")
    }
    fetchCompanies()
  }, [status, session, router])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (selectedExpertise) params.set("expertise", selectedExpertise)
      
      const res = await fetch(`/api/collaboration/companies?${params}`)
      const data = await res.json()
      if (data.success) {
        setCompanies(data.companies)
        setExpertiseList(data.expertise || [])
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async () => {
    if (!selectedCompany) return
    setSending(true)
    try {
      const res = await fetch("/api/collaboration/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedCompany.id,
          message: requestData.message,
          projectScope: requestData.projectScope,
          timeline: requestData.timeline
        })
      })
      const data = await res.json()
      if (data.success) {
        setShowSendModal(false)
        setSelectedCompany(null)
        setRequestData({ message: "", projectScope: "", timeline: "" })
        alert(data.autoApproved ? "Collaboration started! You can now collaborate in the workspace." : "Request sent for admin approval.")
      } else {
        alert("Failed to send request")
      }
    } catch (error) {
      console.error("Failed to send request:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Find Collaboration Partners</h1>
          <p className="text-teal-100 mt-1">Discover companies to collaborate with on client projects</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchCompanies() }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={selectedExpertise}
            onChange={(e) => { setSelectedExpertise(e.target.value); fetchCompanies() }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">All Expertise</option>
            {expertiseList.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
          <button onClick={fetchCompanies} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg" />
                  ) : (
                    <Building2 className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{company.name}</h3>
                  <p className="text-sm text-slate-500">{company.fieldOfExpertise || "General"}</p>
                  {company.location && <p className="text-xs text-slate-400 mt-1">{company.location}</p>}
                </div>
                <button
                  onClick={() => {
                    setSelectedCompany(company)
                    setShowSendModal(true)
                  }}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition"
                >
                  Collaborate
                </button>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2">{company.description || "No description provided"}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {company._count.engagements} projects</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {company.services.length} services</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {company._count.sentCollaborations + company._count.receivedCollaborations} collabs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Request Modal */}
      {showSendModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Collaborate with {selectedCompany.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Scope *</label>
                <input
                  type="text"
                  placeholder="e.g., Website redesign, Mobile app development"
                  value={requestData.projectScope}
                  onChange={(e) => setRequestData({ ...requestData, projectScope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timeline</label>
                <input
                  type="text"
                  placeholder="e.g., 2 months, Q3 2024"
                  value={requestData.timeline}
                  onChange={(e) => setRequestData({ ...requestData, timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  placeholder="Tell them why you want to collaborate..."
                  value={requestData.message}
                  onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowSendModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button
                  onClick={sendRequest}
                  disabled={sending || !requestData.projectScope}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
