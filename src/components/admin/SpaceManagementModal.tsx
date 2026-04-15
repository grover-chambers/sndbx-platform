"use client"

import { useState, useEffect } from "react"
import { Building2, Users, DollarSign, Loader2, Save, Calendar } from "lucide-react"
import { Modal } from "@/components/ui/Modal"

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

interface SpaceManagementModalProps {
  isOpen: boolean
  onClose: () => void
  space?: Space | null
  onSave: () => void
}

const SPACE_TYPES = [
  { value: "BOARDROOM",    label: "Boardroom",    icon: Users,     defaultCapacity: 12, defaultHourly: 7500, bg: "bg-violet-50", active_bg: "bg-violet-600", ic: "text-violet-600" },
  { value: "MEETING_ROOM", label: "Meeting Room", icon: Calendar,  defaultCapacity: 8,  defaultHourly: 4500, bg: "bg-teal-50",   active_bg: "bg-teal-600",   ic: "text-teal-600" },
  { value: "OFFICE",       label: "Office",       icon: Building2, defaultCapacity: 4,  defaultHourly: 3500, bg: "bg-blue-50",   active_bg: "bg-blue-600",   ic: "text-blue-600" },
]

export function SpaceManagementModal({ isOpen, onClose, space, onSave }: SpaceManagementModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "", type: "MEETING_ROOM", capacity: 8,
    description: "", hourlyRate: 4500, dailyRate: "", isActive: true,
  })

  useEffect(() => {
    if (space) {
      setFormData({
        name: space.name,
        type: space.type,
        capacity: space.capacity,
        description: space.description ?? "",
        hourlyRate: space.hourlyRate,
        dailyRate: space.dailyRate?.toString() ?? "",
        isActive: space.isActive,
      })
    } else {
      setFormData({ name: "", type: "MEETING_ROOM", capacity: 8, description: "", hourlyRate: 4500, dailyRate: "", isActive: true })
    }
  }, [space, isOpen])

  const handleTypeChange = (type: string) => {
    const cfg = SPACE_TYPES.find(t => t.value === type)
    setFormData(f => ({ ...f, type, capacity: cfg?.defaultCapacity ?? 8, hourlyRate: cfg?.defaultHourly ?? 4500 }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = space ? `/api/admin/spaces/${space.id}` : "/api/admin/spaces"
      const res = await fetch(url, {
        method: space ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          capacity: parseInt(formData.capacity.toString()),
          description: formData.description || null,
          hourlyRate: parseInt(formData.hourlyRate.toString()),
          dailyRate: formData.dailyRate ? parseInt(formData.dailyRate) : null,
          isActive: formData.isActive,
        }),
      })
      if (res.ok) { onSave(); onClose() }
    } finally {
      setLoading(false)
    }
  }

  const formatKES = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(v)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={space ? "Edit Space" : "Add Space"} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Name */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Space Name</label>
          <input type="text" required value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Executive Boardroom"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {SPACE_TYPES.map(t => {
              const Icon = t.icon
              const isSelected = formData.type === t.value
              return (
                <button key={t.value} type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? "bg-teal-100" : "bg-slate-100"}`}>
                    <Icon className={`w-4 h-4 ${isSelected ? "text-teal-600" : "text-slate-500"}`} />
                  </div>
                  <p className={`text-xs font-semibold text-center leading-tight ${isSelected ? "text-teal-700" : "text-slate-600"}`}>
                    {t.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Capacity + Hourly Rate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Capacity</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" required min={1} value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <p className="text-xs text-slate-400 mt-1">people</p>
          </div>
          <div>
            <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Hourly Rate</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">KES</span>
              <input type="number" required min={0} value={formData.hourlyRate}
                onChange={e => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })}
                className="w-full pl-12 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <p className="text-xs text-slate-400 mt-1">per hour</p>
          </div>
        </div>

        {/* Daily Rate */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
            Daily Rate <span className="normal-case font-normal">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">KES</span>
            <input type="number" min={0} value={formData.dailyRate}
              onChange={e => setFormData({ ...formData, dailyRate: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full pl-12 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {/* Pricing preview */}
        {formData.hourlyRate > 0 && (
          <div className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
            <div>
              <p className="text-xs text-slate-400">Hourly</p>
              <p className="text-sm font-bold text-slate-800">{formatKES(formData.hourlyRate)}</p>
            </div>
            {formData.dailyRate && parseInt(formData.dailyRate) > 0 && (
              <>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400">Daily</p>
                  <p className="text-sm font-bold text-slate-800">{formatKES(parseInt(formData.dailyRate))}</p>
                </div>
              </>
            )}
            {formData.capacity > 0 && (
              <>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-xs text-slate-400">Per seat/hr</p>
                  <p className="text-sm font-bold text-slate-800">{formatKES(Math.round(formData.hourlyRate / formData.capacity))}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Description</label>
          <textarea rows={3} value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the space, amenities, and special features…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input type="checkbox" checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only peer" />
            <div className="w-10 h-6 rounded-full bg-slate-200 peer-checked:bg-teal-500 transition" />
            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Available for booking</p>
            <p className="text-xs text-slate-400">{formData.isActive ? "Space is live and bookable" : "Space is hidden from booking"}</p>
          </div>
        </label>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {space ? "Save Changes" : "Create Space"}
          </button>
        </div>

      </form>
    </Modal>
  )
}
