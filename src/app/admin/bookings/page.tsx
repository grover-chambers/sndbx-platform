"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  Calendar as CalendarIcon, List, CheckCircle, XCircle, Clock,
  Eye, RefreshCw, ChevronLeft, ChevronRight, TrendingUp,
  DollarSign, Building2, Users, AlertCircle, Filter,
  Search, Download, MessageSquare, Phone, Mail, Plus, Settings,
  Edit2, Trash2, CreditCard
} from "lucide-react"
import { BookingDetailModal } from "@/components/admin/BookingDetailModal"
import { SpaceManagementModal } from "@/components/admin/SpaceManagementModal"
import { CreateBookingModal } from "@/components/admin/CreateBookingModal"

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  notes: string | null
  client: {
    id: string
    companyName: string
    user: { name: string; email: string }
  }
  space: {
    id: string
    name: string
    type: string
    capacity: number
    hourlyRate: number
  }
  invoice?: {
    id: string
    invoiceNumber: string
    amount: number
    status: string
  }
}

interface Space {
  id: string
  name: string
  type: string
  capacity: number
  description: string | null
  hourlyRate: number
  dailyRate: number | null
  isActive: boolean
}

interface Analytics {
  total: number
  todayBookings: number
  pending: number
  revenue: number
  spaceUtilization: Array<{
    id: string
    name: string
    bookedDays: number
    totalDays: number
    utilizationRate: number
  }>
  monthlyTrend: Array<{
    month: string
    bookings: number
    revenue: number
    confirmed: number
  }>
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<Booking[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"calendar" | "list">("calendar")
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterSpace, setFilterSpace] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [search, setSearch] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showSpaceModal, setShowSpaceModal] = useState(false)
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("view", view)
    
    if (view === "calendar") {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      params.set("startDate", startDate.toISOString())
      params.set("endDate", endDate.toISOString())
      if (filterSpace) params.set("spaceId", filterSpace)
    } else {
      if (filterStatus) params.set("status", filterStatus)
      if (search) params.set("search", search)
    }
    
    try {
      const res = await fetch(`/api/admin/bookings?${params}`)
      const data = await res.json()
      if (data.success) {
        setBookings(data.bookings || [])
        setAnalytics(data.analytics)
        setPendingApprovals(data.pendingApprovals || [])
        setSpaces(data.spaces || [])
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }, [view, currentMonth, filterSpace, filterStatus, search])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateBookingStatus = async (id: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error("Failed to update booking:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case "CONFIRMED": return "bg-green-100 text-green-700"
      case "PENDING": return "bg-amber-100 text-amber-700"
      case "CANCELLED": return "bg-red-100 text-red-700"
      case "COMPLETED": return "bg-blue-100 text-blue-700"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    
    return days
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      new Date(booking.startTime).toDateString() === date.toDateString()
    )
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const days = getDaysInMonth(currentMonth)
  const formatCurrency = (value: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Bookings Management</h1>
            <p className="text-sm text-slate-500 mt-1">Manage workspace bookings, confirmations, and space utilization</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateBookingModal(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Manual Booking
            </button>
            <button
              onClick={() => setShowSpaceModal(true)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Spaces
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <CalendarIcon className="w-4 h-4" />
                Total Bookings
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Today's Bookings
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.todayBookings}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Approval
              </div>
              <p className="text-2xl font-bold text-navy-900">{analytics.pending}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                Monthly Revenue
              </div>
              <p className="text-2xl font-bold text-navy-900">{formatCurrency(analytics.revenue)}</p>
            </div>
          </div>
        )}

        {/* Pending Approvals Queue */}
        {pendingApprovals.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Pending Approvals ({pendingApprovals.length})
            </h2>
            <div className="space-y-2">
              {pendingApprovals.map(booking => (
                <div key={booking.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{booking.client.companyName}</p>
                      <p className="text-sm text-slate-500">{booking.space.name} · {new Date(booking.startTime).toLocaleString()}</p>
                      <p className="text-xs text-teal-600">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm & Generate Invoice
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                      disabled={actionLoading}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                view === "calendar" ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar View
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                view === "list" ? "bg-teal-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
          </div>
          
          <div className="flex gap-2">
            {view === "list" && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search client or space..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </>
            )}
            <select
              value={filterSpace}
              onChange={(e) => setFilterSpace(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="">All Spaces</option>
              {spaces.map(space => (
                <option key={space.id} value={space.id}>{space.name}</option>
              ))}
            </select>
            <button onClick={fetchBookings} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <RefreshCw className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === "calendar" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-navy-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayBookings = day ? getBookingsForDate(day) : []
                const isToday = day && day.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-slate-100 rounded-lg ${
                      isToday ? "bg-teal-50 border-teal-200" : ""
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm ${isToday ? "font-bold text-teal-600" : "text-slate-600"}`}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayBookings.slice(0, 3).map(booking => (
                            <button
                              key={booking.id}
                              onClick={() => {
                                setSelectedBookingId(booking.id)
                                setModalOpen(true)
                              }}
                              className={`w-full text-xs p-1 rounded text-left truncate ${
                                booking.status === "CONFIRMED" ? "bg-green-100 text-green-700" :
                                booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              }`}
                            >
                              {booking.space.name}
                            </button>
                          ))}
                          {dayBookings.length > 3 && (
                            <div className="text-xs text-slate-400 text-center">
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Client</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Space</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Date & Time</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Duration</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(booking => {
                    const start = new Date(booking.startTime)
                    const end = new Date(booking.endTime)
                    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
                    
                    return (
                      <tr key={booking.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{booking.client.companyName}</p>
                          <p className="text-xs text-slate-400">{booking.client.user.email}</p>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-900">{booking.space.name}</p>
                          <p className="text-xs text-slate-400">{booking.space.type} · {booking.space.capacity} seats</p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {start.toLocaleDateString()} <br />
                          <span className="text-xs">{start.toLocaleTimeString()}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-600">{duration} hour{duration !== 1 ? 's' : ''}</td>
                        <td className="px-5 py-3 font-medium text-teal-600">{formatCurrency(booking.totalAmount)}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                            {booking.status === "CONFIRMED" && <CheckCircle className="w-3 h-3" />}
                            {booking.status === "PENDING" && <Clock className="w-3 h-3" />}
                            {booking.status === "CANCELLED" && <XCircle className="w-3 h-3" />}
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedBookingId(booking.id)
                              setModalOpen(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <BookingDetailModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
        onUpdate={fetchBookings}
      />

      <SpaceManagementModal
        isOpen={showSpaceModal}
        onClose={() => {
          setShowSpaceModal(false)
          setEditingSpace(null)
        }}
        space={editingSpace}
        onSave={() => {
          fetchBookings()
          setShowSpaceModal(false)
          setEditingSpace(null)
        }}
      />

      <CreateBookingModal
        isOpen={showCreateBookingModal}
        onClose={() => setShowCreateBookingModal(false)}
        onSave={fetchBookings}
      />
    </>
  )
}
