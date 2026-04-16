"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Target, Users, DollarSign, Clock, Star, CheckCircle, XCircle, Loader2, ArrowLeft, Send, Sparkles } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  companyName: string
  industry: string | null
  size: string | null
  user: { name: string; email: string }
  needsAssessment: {
    serviceTypes: string[]
    budgetRange: string | null
    timeline: string | null
    additionalContext: string | null
  }
}

interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  fieldOfExpertise: string | null
  logo: string | null
  matchScore: number
  services: Array<{ id: string; title: string; description: string | null }>
}

export default function MatchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const clientId = searchParams.get("client")

  const [client, setClient] = useState<Client | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [suggestions, setSuggestions] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [suggesting, setSuggesting] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [dealValue, setDealValue] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      router.push("/portal/client/dashboard")
    }
    if (clientId) {
      fetchClientAndCompanies()
    } else {
      router.push("/admin/matching")
    }
  }, [status, session, router, clientId])

  const fetchClientAndCompanies = async () => {
    setLoading(true)
    try {
      // Fetch client details
      const clientRes = await fetch(`/api/admin/clients/${clientId}`)
      const clientData = await clientRes.json()
      if (clientData.client) {
        setClient(clientData.client)
      }

      // Fetch all companies
      const companiesRes = await fetch("/api/companies")
      const companiesData = await companiesRes.json()
      if (companiesData.success) {
        setCompanies(companiesData.companies || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSuggestions = async () => {
    if (!client) return
    setSuggesting(true)
    try {
      const res = await fetch("/api/admin/matching/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id })
      })
      const data = await res.json()
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    } finally {
      setSuggesting(false)
    }
  }

  const createMatch = async () => {
    if (!client || !selectedCompany) return
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch("/api/admin/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          companyId: selectedCompany.id,
          dealValue: dealValue ? parseFloat(dealValue) : null,
          notes: notes
        })
      })

      if (res.ok) {
        setMessage({ type: "success", text: "Match created successfully! Both parties have been notified." })
        setTimeout(() => {
          router.push("/admin/matching")
        }, 2000)
      } else {
        setMessage({ type: "error", text: "Failed to create match" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Client not found</p>
        <Link href="/admin/matching" className="text-teal-600 hover:underline mt-2 inline-block">Back to Matching</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/matching" className="text-white/70 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold">Match Client</h1>
              <p className="text-white/80 mt-1 text-sm">{client.companyName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Client Needs Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-600" />
            Client Needs Assessment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm"><span className="text-slate-500">Industry:</span> {client.industry || "—"}</p>
              <p className="text-sm"><span className="text-slate-500">Company Size:</span> {client.size || "—"}</p>
              <p className="text-sm"><span className="text-slate-500">Budget:</span> {client.needsAssessment?.budgetRange || "—"}</p>
              <p className="text-sm"><span className="text-slate-500">Timeline:</span> {client.needsAssessment?.timeline || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">Services Needed:</p>
              <div className="flex flex-wrap gap-1">
                {client.needsAssessment?.serviceTypes?.map((service) => (
                  <span key={service} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full">
                    {service}
                  </span>
                ))}
              </div>
              {client.needsAssessment?.additionalContext && (
                <p className="text-sm mt-2"><span className="text-slate-500">Additional Context:</span> {client.needsAssessment.additionalContext}</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Suggestions Button */}
        {suggestions.length === 0 && !suggesting && (
          <div className="text-center mb-6">
            <button
              onClick={getSuggestions}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              Get AI-Powered Suggestions
            </button>
          </div>
        )}

        {/* Loading Suggestions */}
        {suggesting && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
            <p className="text-slate-500">Analyzing best matches...</p>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="font-semibold text-navy-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              AI-Powered Suggestions (Top {suggestions.length})
            </h2>
            {suggestions.map((company) => (
              <div
                key={company.id}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition cursor-pointer ${
                  selectedCompany?.id === company.id ? "border-teal-500 bg-teal-50/20 ring-2 ring-teal-500" : "border-slate-200"
                }`}
                onClick={() => setSelectedCompany(company)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg" />
                      ) : (
                        <Building2 className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{company.name}</h3>
                      <p className="text-sm text-slate-500">{company.fieldOfExpertise || "General"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal-600">{company.matchScore}%</div>
                    <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1">
                      <div className="bg-teal-600 rounded-full h-1.5" style={{ width: `${company.matchScore}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">{company.description || "No description provided"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Match Confirmation Form */}
        {selectedCompany && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Confirm Match: {selectedCompany.name}
            </h3>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deal Value (Optional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">KES</span>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    className="w-full pl-16 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Add notes about this match..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createMatch}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? "Creating..." : "Confirm Match"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
