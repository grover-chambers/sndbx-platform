"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Target, Users, Building2, DollarSign, Clock, Star,
  TrendingUp, TrendingDown, CheckCircle, XCircle,
  AlertCircle, Filter, Search, RefreshCw, ChevronRight,
  Award, Zap, BarChart3, Activity, MessageSquare,
  Calendar, MapPin, Briefcase, Eye, Send, Sparkles
} from "lucide-react"

interface Client {
  id: string
  companyName: string
  industry: string | null
  status: string
  user: { name: string; email: string }
  needs: Array<{
    id: string
    title: string
    description: string
    budgetRange: string
    timeline: string
    status: string
    createdAt: string
  }>
}

interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  fieldOfExpertise: string | null
  logo: string | null
  website: string | null
  matchScore: number
  rank: number
  metrics?: {
    totalEngagements: number
    completedEngagements: number
    completionRate: number
    avgRating: number
    avgResponseTime: string
  }
  services: Array<{ id: string; title: string; description: string }>
}

interface MatchHistory {
  id: string
  clientName: string
  companyName: string
  stage: string
  dealValue: number
  date: string
}

export default function EnhancedMatchingPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedNeed, setSelectedNeed] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<Company[]>([])
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [suggesting, setSuggesting] = useState(false)
  const [matching, setMatching] = useState(false)
  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [dealValue, setDealValue] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [expandedNeed, setExpandedNeed] = useState<string | null>(null)

  // Analytics stats
  const [stats, setStats] = useState({
    openNeeds: 0,
    avgMatchScore: 78,
    successRate: 67,
    avgResponseTime: "2.4h",
    needsTrend: 5,
    scoreTrend: 3,
    successTrend: 12,
    responseTrend: -0.5
  })

  useEffect(() => {
    fetchClients()
    fetchMatchHistory()
  }, [])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/matching")
      const data = await res.json()
      if (data.clients) {
        setClients(data.clients)
        setStats(prev => ({ ...prev, openNeeds: data.clients.length }))
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchHistory = async () => {
    try {
      const res = await fetch("/api/admin/matching/history")
      const data = await res.json()
      if (data.matches) {
        setMatchHistory(data.matches)
      }
    } catch (error) {
      console.error("Failed to fetch match history:", error)
    }
  }

  const getSuggestions = async (client: Client, need: any) => {
    setSuggesting(true)
    setSelectedClient(client)
    setSelectedNeed(need)
    setSelectedCompany(null)
    setDealValue("")
    setNotes("")
    
    try {
      const res = await fetch("/api/admin/matching/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, needId: need.id })
      })
      const data = await res.json()
      if (data.suggestions) {
        // Add mock metrics to suggestions
        const enrichedSuggestions = data.suggestions.map((c: Company, i: number) => ({
          ...c,
          metrics: {
            totalEngagements: [12, 8, 5, 3][i % 4],
            completedEngagements: [10, 6, 3, 2][i % 4],
            completionRate: [83, 75, 60, 66][i % 4],
            avgRating: [4.9, 4.7, 4.5, 4.3][i % 4],
            avgResponseTime: ["2h", "3h", "5h", "4h"][i % 4]
          }
        }))
        setSuggestions(enrichedSuggestions)
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    } finally {
      setSuggesting(false)
    }
  }

  const createMatch = async () => {
    if (!selectedClient || !selectedCompany) return
    
    setMatching(true)
    setMessage(null)
    
    try {
      const res = await fetch("/api/admin/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          companyId: selectedCompany.id,
          needId: selectedNeed?.id,
          dealValue: dealValue ? parseFloat(dealValue) : null,
          notes: notes
        })
      })
      
      if (res.ok) {
        setMessage({ type: "success", text: "Match created successfully! Both parties have been notified." })
        fetchClients()
        fetchMatchHistory()
        setTimeout(() => {
          setSelectedCompany(null)
          setSelectedClient(null)
          setSelectedNeed(null)
          setSuggestions([])
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: "error", text: "Failed to create match" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setMatching(false)
    }
  }

  const getPriority = (need: any) => {
    const age = Math.ceil((Date.now() - new Date(need.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    const budget = parseInt(need.budgetRange?.replace(/[^0-9]/g, "") || "0")
    
    if (age > 7 || budget > 500000) return { level: "high", color: "red", label: "High", icon: AlertCircle }
    if (age > 3 || budget > 200000) return { level: "medium", color: "yellow", label: "Medium", icon: Clock }
    return { level: "low", color: "green", label: "Low", icon: CheckCircle }
  }

  const getStatusBadge = (stage: string) => {
    switch(stage) {
      case "ACTIVE": return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
      case "PROPOSAL": return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Proposal</span>
      case "COMPLETED": return <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Completed</span>
      case "ARCHIVED": return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Lost</span>
      default: return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Matched</span>
    }
  }

  const filteredClients = clients.filter(client => {
    if (search && !client.companyName.toLowerCase().includes(search.toLowerCase())) return false
    if (filterPriority !== "all") {
      const need = client.needs[0]
      if (need) {
        const priority = getPriority(need)
        if (filterPriority === "high" && priority.level !== "high") return false
        if (filterPriority === "medium" && priority.level !== "medium") return false
        if (filterPriority === "low" && priority.level !== "low") return false
      }
    }
    return true
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Matching Intelligence</h1>
          <p className="text-white/80 mt-1 text-sm">AI-powered client-company matching with insights</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Target className="w-4 h-4" />
              Open Needs
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.openNeeds}</p>
            <p className="text-xs text-green-600 mt-1">↑{stats.needsTrend} vs last week</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Award className="w-4 h-4 text-purple-600" />
              Avg Match Score
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.avgMatchScore}%</p>
            <p className="text-xs text-green-600 mt-1">↑{stats.scoreTrend}% vs last month</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Success Rate
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.successRate}%</p>
            <p className="text-xs text-green-600 mt-1">↑{stats.successTrend}% vs last month</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              Avg Response
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.avgResponseTime}</p>
            <p className="text-xs text-green-600 mt-1">↓{Math.abs(stats.responseTrend)}h faster</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button onClick={fetchClients} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Client Needs Queue
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading clients...</div>
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No clients with open needs</div>
              ) : (
                filteredClients.map(client => {
                  const need = client.needs[0]
                  if (!need) return null
                  const priority = getPriority(need)
                  const PriorityIcon = priority.icon
                  const isExpanded = expandedNeed === need.id
                  
                  return (
                    <div key={client.id}>
                      <div 
                        className={`p-4 hover:bg-slate-50 transition cursor-pointer ${isExpanded ? "bg-teal-50" : ""}`}
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedNeed(null)
                          } else {
                            setExpandedNeed(need.id)
                            getSuggestions(client, need)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <PriorityIcon className={`w-4 h-4 text-${priority.color}-500`} />
                              <p className="font-medium text-slate-900">{client.companyName}</p>
                            </div>
                            <p className="text-sm text-teal-600 mt-1">{need.title}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{need.budgetRange || "Not specified"}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{need.timeline || "Flexible"}</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 pb-4 bg-teal-50 border-t border-teal-100">
                          <div className="mt-3 text-sm text-slate-600">
                            <p className="font-medium text-slate-700 mb-1">Need Details:</p>
                            <p className="text-xs">{need.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedClient ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No client selected</h3>
                <p className="text-sm text-slate-500">Select a client from the list to see AI-powered matching suggestions</p>
              </div>
            ) : suggesting ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                <p className="text-slate-500">Analyzing best matches...</p>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No matches found</h3>
                <p className="text-sm text-slate-500">No suitable companies found for this client's needs</p>
              </div>
            ) : (
              <>
                {/* Client Need Summary */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-teal-600" />
                        Matching for: {selectedClient.companyName}
                      </h3>
                      <p className="text-lg font-medium text-navy-900 mt-1">{selectedNeed?.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedNeed?.description}</p>
                      <div className="flex gap-3 mt-3">
                        {selectedNeed?.budgetRange && <span className="text-xs bg-white px-2 py-0.5 rounded-full">💰 Budget: {selectedNeed.budgetRange}</span>}
                        {selectedNeed?.timeline && <span className="text-xs bg-white px-2 py-0.5 rounded-full">⏰ Timeline: {selectedNeed.timeline}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">{suggestions[0]?.matchScore || 0}%</div>
                      <p className="text-xs text-slate-500">Top match score</p>
                    </div>
                  </div>
                </div>

                {/* Top 3 Suggestions */}
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  AI-Powered Suggestions (Top {suggestions.length})
                </h3>
                
                <div className="space-y-4">
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
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-slate-900">{company.name}</h4>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">#{company.rank} Match</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{company.fieldOfExpertise}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-600">{company.matchScore}%</div>
                          <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1">
                            <div className="bg-teal-600 rounded-full h-1.5" style={{ width: `${company.matchScore}%` }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3 mt-4 text-center">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Briefcase className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                          <p className="text-sm font-semibold">{company.metrics?.totalEngagements || 0}</p>
                          <p className="text-xs text-slate-500">Deals</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 mx-auto text-green-500 mb-1" />
                          <p className="text-sm font-semibold">{company.metrics?.completionRate || 0}%</p>
                          <p className="text-xs text-slate-500">Success</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Star className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                          <p className="text-sm font-semibold">{company.metrics?.avgRating || 0}</p>
                          <p className="text-xs text-slate-500">Rating</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Clock className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                          <p className="text-sm font-semibold">{company.metrics?.avgResponseTime || "—"}</p>
                          <p className="text-xs text-slate-500">Response</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">{company.description || "No description provided"}</p>
                    </div>
                  ))}
                </div>

                {/* Match Confirmation Form */}
                {selectedCompany && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Confirm Match: {selectedCompany.name}
                    </h3>
                    
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
                          disabled={matching}
                          className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {matching ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Send className="w-4 h-4" />}
                          {matching ? "Creating..." : "Confirm Match"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Match History */}
        {matchHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Recent Match History
            </h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Client</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Company</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Stage</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Value</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Date</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matchHistory.slice(0, 5).map((match) => (
                      <tr key={match.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 font-medium text-slate-900">{match.clientName}</td>
                        <td className="px-5 py-3 text-slate-600">{match.companyName}</td>
                        <td className="px-5 py-3">{getStatusBadge(match.stage)}</td>
                        <td className="px-5 py-3 font-medium text-teal-600">{formatCurrency(match.dealValue)}</td>
                        <td className="px-5 py-3 text-slate-500">{new Date(match.date).toLocaleDateString()}</td>
                        <td className="px-5 py-3">
                          {match.stage === "COMPLETED" ? (
                            <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Successful</span>
                          ) : match.stage === "ACTIVE" ? (
                            <span className="text-xs text-blue-600 flex items-center gap-1"><Activity className="w-3 h-3" /> In Progress</span>
                          ) : match.stage === "ARCHIVED" ? (
                            <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> Lost</span>
                          ) : (
                            <span className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
