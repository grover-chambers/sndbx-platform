"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Calendar, Clock, Users, DollarSign, CheckCircle, XCircle, Loader2, Search, Filter, Building2, CreditCard } from "lucide-react"
import Link from "next/link"

interface Space {
  id: string
  name: string
  type: string
  capacity: number
  description: string
  hourlyRate: number
  dailyRate: number
  images: string[]
  isActive: boolean
  bookings: Array<{
    id: string
    startTime: string
    endTime: string
    status: string
    client: { companyName: string }
  }>
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  status: string
  totalAmount: number
  notes: string | null
  space: Space
  invoice?: {
    id: string
    invoiceNumber: string
    amount: number
    status: string
    dueDate: string
  }
}

export default function ClientBookingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
    notes: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"browse" | "my-bookings">("browse")
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchData = async () => {
      try {
        const [spacesRes, bookingsRes] = await Promise.all([
          fetch("/api/spaces"),
          fetch("/api/bookings")
        ])
        const spacesData = await spacesRes.json()
        const bookingsData = await bookingsRes.json()
        
        if (spacesData.success) setSpaces(spacesData.spaces || [])
        if (bookingsData.success) setMyBookings(bookingsData.bookings || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) fetchData()
  }, [status, router, session])

  // Calculate amount when date/time changes
  useEffect(() => {
    if (selectedSpace && bookingData.startTime && bookingData.endTime) {
      const start = new Date(bookingData.startTime)
      const end = new Date(bookingData.endTime)
      const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)))
      setDuration(hours)
      setCalculatedAmount(selectedSpace.hourlyRate * hours)
    } else {
      setCalculatedAmount(0)
      setDuration(0)
    }
  }, [selectedSpace, bookingData.startTime, bookingData.endTime])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSpace) return
    
    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          notes: bookingData.notes
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert("Booking request submitted! An invoice has been generated. Please wait for confirmation.")
        setShowBookingModal(false)
        setSelectedSpace(null)
        setBookingData({ startTime: "", endTime: "", notes: "" })
        // Refresh bookings
        const bookingsRes = await fetch("/api/bookings")
        const bookingsData = await bookingsRes.json()
        if (bookingsData.success) setMyBookings(bookingsData.bookings)
      } else {
        alert(data.error || "Failed to create booking. Please try again.")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "CONFIRMED": return <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Confirmed</span>
      case "PENDING": return <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pending</span>
      case "CANCELLED": return <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Cancelled</span>
      case "COMPLETED": return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Completed</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{status}</span>
    }
  }

  const getSpaceTypeIcon = (type: string) => {
    switch(type) {
      case "BOARDROOM": return <Users className="w-5 h-5" />
      case "OFFICE": return <Building2 className="w-5 h-5" />
      default: return <Calendar className="w-5 h-5" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Workspace Bookings</h1>
          <p className="text-slate-500 mt-1 text-sm">Book boardrooms, offices, and meeting spaces</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("browse")}
            className={`pb-3 px-2 text-sm font-medium transition ${
              activeTab === "browse" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Browse Spaces
          </button>
          <button
            onClick={() => setActiveTab("my-bookings")}
            className={`pb-3 px-2 text-sm font-medium transition ${
              activeTab === "my-bookings" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>

        {activeTab === "browse" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {spaces.filter(s => s.isActive).map((space) => (
              <div key={space.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        {getSpaceTypeIcon(space.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{space.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {space.type.replace("_", " ")}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {space.capacity} people
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-navy-900">{formatCurrency(space.hourlyRate)}/hour</p>
                      {space.dailyRate && (
                        <p className="text-xs text-slate-500">{formatCurrency(space.dailyRate)}/day</p>
                      )}
                    </div>
                  </div>

                  {space.description && (
                    <p className="text-sm text-slate-600 mb-4">{space.description}</p>
                  )}

                  <button
                    onClick={() => {
                      setSelectedSpace(space)
                      setShowBookingModal(true)
                    }}
                    className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm font-medium"
                  >
                    Book This Space
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "my-bookings" && (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No bookings yet</h3>
                <p className="text-slate-500">Browse spaces and make your first booking</p>
                <button onClick={() => setActiveTab("browse")} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
                  Browse Spaces
                </button>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{booking.space.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.startTime).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(booking.status)}
                      <p className="text-sm font-semibold text-navy-900 mt-1">{formatCurrency(booking.totalAmount)}</p>
                    </div>
                  </div>
                  
                  {booking.invoice && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-slate-400" />
                        <span>Invoice: {booking.invoice.invoiceNumber}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        booking.invoice.status === "PAID" ? "bg-green-100 text-green-700" :
                        booking.invoice.status === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {booking.invoice.status}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSpace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Book {selectedSpace.name}</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.startTime}
                  onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={bookingData.endTime}
                  onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              {duration > 0 && calculatedAmount > 0 && (
                <div className="bg-teal-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-medium">{duration} hour{duration !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mt-1">
                    <span>Total Amount:</span>
                    <span className="text-teal-600">{formatCurrency(calculatedAmount)}</span>
                  </div>
                  <p className="text-xs text-teal-600 mt-2">An invoice will be generated upon submission</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Any special requirements?"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {submitting ? "Processing..." : "Request Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
