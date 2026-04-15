"use client"

import { useState, useEffect } from "react"
import {
  Calendar, Clock, DollarSign, Mail,
  CheckCircle, XCircle, Loader2, MessageSquare,
  Building2, Users, ArrowRight, Copy, Check
} from "lucide-react"
import { Modal } from "@/components/ui/Modal"

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
    industry: string | null
    user: { id: string; name: string; email: string }
  }
  space: {
    id: string
    name: string
    type: string
    capacity: number
    hourlyRate: number
    dailyRate: number | null
    description: string | null
  }
}

interface BookingDetailModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
  onUpdate: () => void
}

const STATUS = {
  CONFIRMED: { label: "Confirmed",  dot: "#1D9E75", bg: "#E1F5EE", text: "#0F6E56" },
  PENDING:   { label: "Pending",    dot: "#EF9F27", bg: "#FAEEDA", text: "#854F0B" },
  CANCELLED: { label: "Cancelled",  dot: "#E24B4A", bg: "#FCEBEB", text: "#A32D2D" },
  COMPLETED: { label: "Completed",  dot: "#378ADD", bg: "#E6F1FB", text: "#185FA5" },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS[status as keyof typeof STATUS] ?? { label: status, dot: "#888", bg: "#f1f1f1", text: "#555" }
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full">
      <span style={{ background: s.dot }} className="w-1.5 h-1.5 rounded-full inline-block" />
      {s.label}
    </span>
  )
}

export function BookingDetailModal({ isOpen, onClose, bookingId, onUpdate }: BookingDetailModalProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (bookingId && isOpen) fetchBooking()
  }, [bookingId, isOpen])

  const fetchBooking = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`)
      const data = await res.json()
      if (data.success) setBooking(data.booking)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    setUpdating(true)
    setFlash(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setFlash({ type: "success", text: `Booking ${status.toLowerCase()}.` })
        onUpdate()
        setTimeout(() => { fetchBooking(); setFlash(null) }, 1500)
      } else {
        setFlash({ type: "error", text: "Failed to update booking." })
      }
    } finally {
      setUpdating(false)
    }
  }

  const formatKES = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(v)

  const getDuration = () => {
    if (!booking) return "—"
    const hrs = Math.ceil(
      (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 3600000
    )
    return `${hrs} hr${hrs !== 1 ? "s" : ""}`
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("en-KE", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    })

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin + `/admin/bookings?id=${bookingId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = (name: string) =>
    name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : !booking ? (
        <div className="py-16 text-center text-slate-400 text-sm">Booking not found</div>
      ) : (
        <div className="space-y-5">

          {/* ID + Status row */}
          <div className="flex items-center justify-between">
            <StatusPill status={booking.status} />
            <span className="text-xs text-slate-400 font-mono">#{booking.id.slice(-8).toUpperCase()}</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Client</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700 flex-shrink-0">
                  {initials(booking.client.companyName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{booking.client.companyName}</p>
                  <p className="text-xs text-slate-500 truncate">{booking.client.user.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Space</p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{booking.space.name}</p>
                  <p className="text-xs text-slate-500">{booking.space.type.replace("_", " ")} · {booking.space.capacity} seats</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time block */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-3">Schedule</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-center bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">Start</p>
                <p className="text-sm font-semibold text-slate-800">{fmtDate(booking.startTime)}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <div className="flex-1 text-center bg-slate-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-slate-400 mb-0.5">End</p>
                <p className="text-sm font-semibold text-slate-800">{fmtDate(booking.endTime)}</p>
              </div>
              <div className="flex-shrink-0 text-center bg-teal-50 rounded-lg px-3 py-2.5">
                <p className="text-[10px] text-teal-500 mb-0.5">Duration</p>
                <p className="text-sm font-bold text-teal-700">{getDuration()}</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50 px-5 py-4">
            <div>
              <p className="text-xs text-teal-600 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-teal-700 tracking-tight">{formatKES(booking.totalAmount)}</p>
            </div>
            <div className="text-right text-xs text-teal-600 opacity-70">
              <p>{formatKES(booking.space.hourlyRate)} / hr</p>
              {booking.space.dailyRate && <p>{formatKES(booking.space.dailyRate)} / day</p>}
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-amber-500 uppercase mb-1">Special Requests</p>
                <p className="text-sm text-amber-800">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Flash */}
          {flash && (
            <div className={`text-sm px-4 py-3 rounded-xl ${
              flash.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {flash.text}
            </div>
          )}

          {/* Action buttons by status */}
          {booking.status === "PENDING" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => updateStatus("CANCELLED")} disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-40">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => updateStatus("CONFIRMED")} disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40">
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm
              </button>
            </div>
          )}

          {booking.status === "CONFIRMED" && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => updateStatus("CANCELLED")} disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-40">
                <XCircle className="w-4 h-4" /> Cancel
              </button>
              <button onClick={() => updateStatus("COMPLETED")} disabled={updating}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-900 transition disabled:opacity-40">
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark Complete
              </button>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2 pt-1 border-t border-slate-100">
            <a href={`mailto:${booking.client.user.email}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <Mail className="w-3.5 h-3.5" /> Email client
            </a>
            <button onClick={copyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              {copied ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>

        </div>
      )}
    </Modal>
  )
}
