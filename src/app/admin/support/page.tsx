"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  HelpCircle, MessageSquare, Clock, CheckCircle, XCircle,
  AlertCircle, Send, RefreshCw, Search, Filter, Eye,
  Calendar, DollarSign, Building2, User, Phone, Mail,
  ChevronRight, ChevronLeft, Star, TrendingUp, Zap,
  Ban, Calendar as CalendarIcon, Edit2, Save, X
} from "lucide-react"

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  issueType: string
  priority: string
  status: string
  userId: string
  user: {
    name: string
    email: string
    role: string
  }
  relatedBookingId?: string
  relatedEngagementId?: string
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

interface Message {
  id: string
  content: string
  isFromAdmin: boolean
  createdAt: string
}

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [search, setSearch] = useState("")
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolutionNote, setResolutionNote] = useState("")

  const [stats, setStats] = useState({
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResponseTime: "2.4h",
    satisfaction: 4.7
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    if (session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ADMIN") {
      fetchTickets()
      fetchStats()
    }
  }, [status, session, filterStatus, filterPriority, search])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterPriority !== "all") params.set("priority", filterPriority)
      if (search) params.set("search", search)
      
      const res = await fetch(`/api/admin/support?${params}`)
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/support/stats")
      const data = await res.json()
      if (data.success && data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/support/${id}`)
      const data = await res.json()
      if (data.success && data.ticket) {
        setSelectedTicket(data.ticket)
      }
    } catch (error) {
      console.error("Failed to fetch ticket details:", error)
    }
  }

  const sendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return
    
    setSending(true)
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      })
      
      if (res.ok) {
        setReplyText("")
        fetchTicketDetails(selectedTicket.id)
        fetchTickets()
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setSending(false)
    }
  }

  const updateTicketStatus = async (status: string, resolution?: string) => {
    if (!selectedTicket) return
    
    try {
      const res = await fetch(`/api/admin/support/${selectedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution })
      })
      
      if (res.ok) {
        fetchTicketDetails(selectedTicket.id)
        fetchTickets()
        setShowResolveModal(false)
        setResolutionNote("")
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case "HIGH": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" /> High</span>
      case "MEDIUM": return <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Medium</span>
      case "LOW": return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Low</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{priority}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "OPEN": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><AlertCircle className="w-3 h-3" /> Open</span>
      case "IN_PROGRESS": return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> In Progress</span>
      case "RESOLVED": return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Resolved</span>
      case "CLOSED": return <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Closed</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status}</span>
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Support Center</h1>
          <p className="text-white/80 mt-1 text-sm">Manage customer support tickets and resolve issues</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Open Tickets
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.open}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              In Progress
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.inProgress}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Resolved
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.resolved}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Zap className="w-4 h-4 text-purple-500" />
              Avg Response
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.avgResponseTime}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              Satisfaction
            </div>
            <p className="text-2xl font-bold text-navy-900">{stats.satisfaction}/5</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button onClick={() => { fetchTickets(); fetchStats(); }} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Ticket Queue
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No tickets found</div>
              ) : (
                tickets.map(ticket => (
                  <div
                    key={ticket.id}
                    onClick={() => fetchTicketDetails(ticket.id)}
                    className={`p-4 hover:bg-slate-50 transition cursor-pointer ${
                      selectedTicket?.id === ticket.id ? "bg-teal-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(ticket.priority)}
                          <p className="text-xs text-slate-400">{ticket.ticketNumber}</p>
                        </div>
                        <p className="font-medium text-slate-900 mt-1 line-clamp-1">{ticket.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{ticket.user?.name || ticket.user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(ticket.status)}
                          <span className="text-xs text-slate-400">{Math.ceil((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60))}h ago</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="lg:col-span-2">
            {!selectedTicket ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No ticket selected</h3>
                <p className="text-sm text-slate-500">Select a ticket from the list to view details</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-5 border-b border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getPriorityBadge(selectedTicket.priority)}
                        {getStatusBadge(selectedTicket.status)}
                      </div>
                      <h2 className="text-xl font-semibold text-navy-900">{selectedTicket.title}</h2>
                      <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket.ticketNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedTicket.status === "OPEN" && (
                        <button
                          onClick={() => updateTicketStatus("IN_PROGRESS")}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Start Working
                        </button>
                      )}
                      {(selectedTicket.status === "OPEN" || selectedTicket.status === "IN_PROGRESS") && (
                        <button
                          onClick={() => setShowResolveModal(true)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-slate-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">User</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-teal-600">
                            {selectedTicket.user?.name?.charAt(0) || selectedTicket.user?.email?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{selectedTicket.user?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{selectedTicket.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Issue Type</p>
                      <p className="text-sm capitalize">{selectedTicket.issueType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Created</p>
                      <p className="text-sm">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Last Updated</p>
                      <p className="text-sm">{new Date(selectedTicket.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedTicket.description}</p>
                </div>

                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Conversation</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      selectedTicket.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isFromAdmin ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg p-3 ${
                            msg.isFromAdmin ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.isFromAdmin ? "text-teal-100" : "text-slate-400"}`}>
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400 text-sm">No messages yet</div>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {sending ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Send className="w-4 h-4" />}
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Resolve Ticket</h3>
            <textarea
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Add resolution notes (optional)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowResolveModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
              <button onClick={() => updateTicketStatus("RESOLVED", resolutionNote)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
