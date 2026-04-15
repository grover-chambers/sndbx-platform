"use client"

import { useState, useEffect } from "react"
import {
  Calendar, DollarSign, Clock,
  CheckCircle, Loader2,
  TrendingUp, Target, FileText, Archive, BarChart2
} from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface Engagement {
  id: string
  stage: string
  dealValue: number | null
  notes: string | null
  startedAt: string
  completedAt: string | null
  createdAt: string
  client: {
    id: string
    companyName: string
    industry: string | null
    user: { name: string; email: string }
  }
  company: {
    id: string
    name: string
    fieldOfExpertise: string | null
    users: Array<{ name: string; email: string }>
  }
  matcher: { name: string; email: string } | null
  timeline: Array<{ id: string; stage: string; note: string | null; createdAt: string }>
  invoices: Array<{ id: string; amount: number; status: string }>
}

interface EngagementDetailModalProps {
  isOpen: boolean
  onClose: () => void
  engagementId: string | null
  onUpdate: () => void
}

const STAGES = [
  { value: "MATCHED",   label: "Matched",   Icon: Target,     bg: "#E6F1FB", text: "#185FA5", active_bg: "#185FA5" },
  { value: "PROPOSAL",  label: "Proposal",  Icon: FileText,   bg: "#FAEEDA", text: "#854F0B", active_bg: "#854F0B" },
  { value: "ACTIVE",    label: "Active",    Icon: TrendingUp, bg: "#E1F5EE", text: "#0F6E56", active_bg: "#0F6E56" },
  { value: "COMPLETED", label: "Completed", Icon: CheckCircle,bg: "#EAF3DE", text: "#3B6D11", active_bg: "#3B6D11" },
  { value: "ARCHIVED",  label: "Archived",  Icon: Archive,    bg: "#F1EFE8", text: "#5F5E5A", active_bg: "#5F5E5A" },
]

function StagePill({ stage }: { stage: string }) {
  const s = STAGES.find(s => s.value === stage)
  if (!s) return <span className="text-xs text-slate-400">{stage}</span>
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full">
      <s.Icon className="w-3 h-3" />
      {s.label}
    </span>
  )
}

export function EngagementDetailModal({ isOpen, onClose, engagementId, onUpdate }: EngagementDetailModalProps) {
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStage, setSelectedStage] = useState("")
  const [adminNote, setAdminNote] = useState("")
  const [dealValue, setDealValue] = useState("")
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (engagementId && isOpen) fetchEngagement()
  }, [engagementId, isOpen])

  const fetchEngagement = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/engagements/${engagementId}`)
      const data = await res.json()
      if (data.engagement) {
        setEngagement(data.engagement)
        setSelectedStage(data.engagement.stage)
        setDealValue(data.engagement.dealValue?.toString() ?? "")
      }
    } finally {
      setLoading(false)
    }
  }

  const updateEngagement = async () => {
    if (!engagement) return
    setUpdating(true)
    setFlash(null)
    try {
      const res = await fetch(`/api/admin/engagements/${engagement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: selectedStage,
          notes: adminNote || undefined,
          dealValue: dealValue ? parseFloat(dealValue) : null,
        }),
      })
      if (res.ok) {
        setFlash({ type: "success", text: "Engagement updated." })
        setAdminNote("")
        fetchEngagement()
        onUpdate()
        setTimeout(() => setFlash(null), 3000)
      } else {
        setFlash({ type: "error", text: "Failed to update." })
      }
    } finally {
      setUpdating(false)
    }
  }

  const formatKES = (v: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(v)

  const ageDays = engagement
    ? Math.floor((Date.now() - new Date(engagement.createdAt).getTime()) / 86400000)
    : 0

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Engagement" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : !engagement ? (
        <div className="py-16 text-center text-slate-400 text-sm">Engagement not found</div>
      ) : (
        <div className="space-y-5">

          {/* Stage + ID */}
          <div className="flex items-center justify-between">
            <StagePill stage={engagement.stage} />
            <span className="text-xs text-slate-400 font-mono">#{engagement.id.slice(-8).toUpperCase()}</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Client",  name: engagement.client.companyName,  sub: engagement.client.industry ?? engagement.client.user.email, bg: "bg-teal-50",   ic: "bg-teal-100 text-teal-700" },
              { label: "Company", name: engagement.company.name,         sub: engagement.company.fieldOfExpertise ?? "General",           bg: "bg-violet-50", ic: "bg-violet-100 text-violet-700" },
            ].map(({ label, name, sub, bg, ic }) => (
              <div key={label} className={`${bg} rounded-xl p-4 space-y-2`}>
                <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${ic} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                    {name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                    <p className="text-xs text-slate-500 truncate">{sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <Calendar className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Started</p>
              <p className="text-sm font-semibold text-slate-800">
                {new Date(engagement.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
              <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Age</p>
              <p className="text-sm font-semibold text-slate-800">
                {ageDays === 0 ? "Today" : ageDays === 1 ? "1 day" : `${ageDays} days`}
              </p>
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 text-center">
              <DollarSign className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <p className="text-xs text-teal-600">Deal Value</p>
              <p className="text-sm font-bold text-teal-700">
                {engagement.dealValue ? formatKES(engagement.dealValue) : "—"}
              </p>
            </div>
          </div>

          {/* Stage selector */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Update Stage</p>
            <div className="flex gap-2 flex-wrap">
              {STAGES.map(s => (
                <button key={s.value} type="button"
                  onClick={() => setSelectedStage(s.value)}
                  style={selectedStage === s.value
                    ? { background: s.active_bg, color: "#fff" }
                    : { background: s.bg, color: s.text }
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                  <s.Icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deal value update */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Deal Value (KES)</p>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" value={dealValue}
                onChange={e => setDealValue(e.target.value)}
                placeholder="Enter deal value…"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>

          {/* Admin note */}
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Add Note</p>
            <textarea rows={3} value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="Internal notes about this engagement…"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
          </div>

          {/* Timeline */}
          {engagement.timeline.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Timeline</p>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {engagement.timeline.map((item, i) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                      {i < engagement.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-slate-200 mt-1 min-h-[16px]" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-slate-700">
                        {item.note ?? `Stage → ${item.stage}`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleString("en-KE", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices summary */}
          {engagement.invoices.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Invoices</p>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatKES(engagement.invoices.reduce((s, inv) => s + inv.amount, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Paid</p>
                  <p className="text-sm font-bold text-teal-700">
                    {formatKES(engagement.invoices.filter(i => i.status === "PAID").reduce((s, i) => s + i.amount, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Count</p>
                  <p className="text-sm font-bold text-slate-800">{engagement.invoices.length}</p>
                </div>
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

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
              Close
            </button>
            <button onClick={updateEngagement} disabled={updating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40">
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Changes
            </button>
          </div>

        </div>
      )}
    </Modal>
  )
}
