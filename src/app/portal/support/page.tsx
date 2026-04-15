"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { HelpCircle, Send, AlertCircle, CheckCircle, X, Loader2, MessageSquare, Clock } from "lucide-react"

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  issueType: string
  status: string
  createdAt: string
  messages?: Message[]
}

interface Message {
  id: string
  content: string
  isFromAdmin: boolean
  createdAt: string
}

export default function UserSupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"new" | "my">("new")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    issueType: "other"
  })
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  const issueTypes = [
    { value: "booking", label: "Booking Issue" },
    { value: "match", label: "Match/Engagement Issue" },
    { value: "account", label: "Account Issue" },
    { value: "payment", label: "Payment Issue" },
    { value: "technical", label: "Technical Problem" },
    { value: "other", label: "Other" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setFormData({ title: "", description: "", issueType: "other" })
        setActiveTab("my")
        fetchMyTickets()
      }
    } catch (error) {
      console.error("Failed to submit ticket:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const fetchMyTickets = async () => {
    try {
      const res = await fetch("/api/support/my")
      const data = await res.json()
      if (data.success) {
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
    }
  }

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/support/${id}`)
      const data = await res.json()
      if (data.success) {
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
      const res = await fetch(`/api/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText })
      })
      
      if (res.ok) {
        setReplyText("")
        fetchTicketDetails(selectedTicket.id)
      }
    } catch (error) {
      console.error("Failed to send reply:", error)
    } finally {
      setSending(false)
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

  if (status === "unauthenticated") {
    router.push("/auth/login")
    return null
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Support Center</h1>
          <p className="text-slate-500 mt-1 text-sm">Get help from the SNDBX support team</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("new")}
            className={`pb-3 px-2 text-sm font-medium transition ${
              activeTab === "new" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"
            }`}
          >
            New Ticket
          </button>
          <button
            onClick={() => { setActiveTab("my"); fetchMyTickets(); }}
            className={`pb-3 px-2 text-sm font-medium transition ${
              activeTab === "my" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500"
            }`}
          >
            My Tickets ({tickets.length})
          </button>
        </div>

        {activeTab === "new" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Create Support Ticket</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Type</label>
                  <select
                    value={formData.issueType}
                    onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    {issueTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Brief summary of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Ticket
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "my" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  My Tickets
                </h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {tickets.length === 0 ? (
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
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="font-medium text-slate-900">{ticket.title}</p>
                          <p className="text-xs text-slate-500 mt-1">#{ticket.ticketNumber} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
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
                  <p className="text-sm text-slate-500">Select a ticket to view details and conversation</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(selectedTicket.status)}
                        </div>
                        <h2 className="text-xl font-semibold text-navy-900">{selectedTicket.title}</h2>
                        <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket.ticketNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                    <p className="text-sm text-slate-600">{selectedTicket.description}</p>
                  </div>

                  <div className="p-5 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Conversation</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.isFromAdmin ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.isFromAdmin ? "bg-slate-100 text-slate-700" : "bg-teal-600 text-white"
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.isFromAdmin ? "text-slate-400" : "text-teal-100"}`}>
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

                  {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" && (
                    <div className="p-5">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Add a reply..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={sendReply}
                          disabled={sending || !replyText.trim()}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
