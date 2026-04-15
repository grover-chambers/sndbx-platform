"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, Users, DollarSign, Building2, Loader2, CheckCircle, ArrowRight } from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface Space {
  id: string
  name: string
  type: string
  capacity: number
  hourlyRate: number
}

interface Client {
  id: string
  companyName: string
  user: { name: string; email: string }
}

interface CreateBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function CreateBookingModal({ isOpen, onClose, onSave }: CreateBookingModalProps) {
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState({
    clientId: "", spaceId: "", startTime: "", endTime: "", notes: "",
  })

  useEffect(() => {
    if (isOpen) { fetchSpaces(); fetchClients() }
  }, [isOpen])

  useEffect(() => {
    setSelectedSpace(spaces.find(s => s.id === formData.spaceId) ?? null)
  }, [formData.spaceId, spaces])

  useEffect(() => {
    setSelectedClient(clients.find(c => c.id === formData.clientId) ?? null)
  }, [formData.clientId, clients])

  const fetchSpaces = async () => {
    try {
      const res = await fetch("/api/admin/spaces?active=true")
      const data = await res.json()
      if (data.success) setSpaces(data.spaces)
    } catch {}
  }

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients?limit=100")
      const data = await res.json()
      if (data.clients) setClients(data.clients)
    } catch {}
  }

  const calcAmount = () => {
    if (!selectedSpace || !formData.startTime || !formData.endTime) return 0
    const hrs = Math.max(1, Math.ceil(
      (new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / 3600000
    ))
    return selectedSpace.hourlyRate * hrs
  }

  const getDuration = () => {
    if (!formData.startTime || !formData.endTime) return null
    const hrs = Math.ceil(
      (new Date(formData.endTime).getTime() - new Date(formData.startTime).getTime()) / 3600000
    )
    return `${hrs} hr${hrs !== 1 ? "s" : ""}`
  }

  const formatKES = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(v)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalAmount: calcAmount() }),
      })
      if (res.ok) {
        onSave()
        onClose()
        setFormData({ clientId: "", spaceId: "", startTime: "", endTime: "", notes: "" })
      }
    } finally {
      setLoading(false)
    }
  }

  const amount = calcAmount()
  const duration = getDuration()
  const canSubmit = formData.clientId && formData.spaceId && formData.startTime && formData.endTime && amount > 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Booking" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Client */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Client</label>
          <select required value={formData.clientId}
            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option value="">Select a client…</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.companyName} — {c.user.email}</option>
            ))}
          </select>
          {selectedClient && (
            <p className="mt-1.5 text-xs text-slate-500 pl-1">
              {selectedClient.user.name && `${selectedClient.user.name} · `}{selectedClient.user.email}
            </p>
          )}
        </div>

        {/* Space */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Space</label>
          <div className="grid grid-cols-1 gap-2">
            {spaces.map(space => (
              <button type="button" key={space.id}
                onClick={() => setFormData({ ...formData, spaceId: space.id })}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
                  formData.spaceId === space.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    formData.spaceId === space.id ? "bg-teal-100" : "bg-slate-100"
                  }`}>
                    <Building2 className={`w-4 h-4 ${formData.spaceId === space.id ? "text-teal-600" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${formData.spaceId === space.id ? "text-teal-800" : "text-slate-800"}`}>
                      {space.name}
                    </p>
                    <p className="text-xs text-slate-400">{space.type.replace("_", " ")} · {space.capacity} seats</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${formData.spaceId === space.id ? "text-teal-700" : "text-slate-600"}`}>
                  {formatKES(space.hourlyRate)}<span className="font-normal text-xs">/hr</span>
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Time</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">Start</p>
              <input type="datetime-local" required value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 mt-4" />
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-1">End</p>
              <input type="datetime-local" required value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
        </div>

        {/* Summary pill */}
        {duration && selectedSpace && (
          <div className="flex items-center justify-between rounded-xl bg-teal-50 border border-teal-100 px-5 py-4">
            <div>
              <p className="text-xs text-teal-600 font-medium">Duration</p>
              <p className="text-lg font-bold text-teal-700">{duration}</p>
            </div>
            <div className="w-px h-8 bg-teal-100" />
            <div className="text-right">
              <p className="text-xs text-teal-600 font-medium">Total</p>
              <p className="text-lg font-bold text-teal-700">{formatKES(amount)}</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Notes <span className="normal-case font-normal">(optional)</span></label>
          <textarea rows={2} value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Special requests or setup notes…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading || !canSubmit}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Create Booking
          </button>
        </div>
      </form>
    </Modal>
  )
}
