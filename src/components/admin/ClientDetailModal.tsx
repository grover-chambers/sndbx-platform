"use client"

import { useState, useEffect } from "react"
import { User, Mail, Briefcase, Calendar, Building2, ExternalLink, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface Client {
  id: string
  companyName: string
  industry: string | null
  size: string | null
  status: string
  userId: string
  createdAt: string
  user: {
    name: string | null
    email: string
    createdAt: string
  }
  _count?: { engagements: number; bookings: number }
  engagements?: Array<{
    id: string
    stage: string
    company: { name: string }
    createdAt: string
  }>
}

interface ClientDetailModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string | null
}

const STAGE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE:    { bg: "#E1F5EE", text: "#0F6E56", label: "Active" },
  PROPOSAL:  { bg: "#FAEEDA", text: "#854F0B", label: "Proposal" },
  MATCHED:   { bg: "#E6F1FB", text: "#185FA5", label: "Matched" },
  COMPLETED: { bg: "#EAF3DE", text: "#3B6D11", label: "Completed" },
  ARCHIVED:  { bg: "#F1EFE8", text: "#5F5E5A", label: "Archived" },
}

function StagePill({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage] ?? { bg: "#F1EFE8", text: "#5F5E5A", label: stage }
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="text-xs font-semibold px-2.5 py-1 rounded-full">{s.label}</span>
  )
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  return (
    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-lg font-bold text-teal-700 flex-shrink-0">
      {initials || <Building2 className="w-6 h-6 text-teal-600" />}
    </div>
  )
}

export function ClientDetailModal({ isOpen, onClose, clientId }: ClientDetailModalProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clientId && isOpen) fetchClient()
  }, [clientId, isOpen])

  const fetchClient = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`)
      const data = await res.json()
      if (data.client) setClient(data.client)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Client" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        </div>
      ) : !client ? (
        <div className="py-16 text-center text-slate-400 text-sm">Client not found</div>
      ) : (
        <div className="space-y-5">

          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar name={client.companyName} />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900 truncate">{client.companyName}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span style={client.status === "ACTIVE"
                  ? { background: "#E1F5EE", color: "#0F6E56" }
                  : { background: "#F1EFE8", color: "#5F5E5A" }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full">
                  {client.status}
                </span>
                {client.industry && (
                  <span className="text-xs text-slate-400">{client.industry}</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact + Account details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Contact</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">{client.user.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <a href={`mailto:${client.user.email}`}
                    className="text-sm text-teal-600 hover:underline truncate">{client.user.email}</a>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Account</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-700">
                    Joined {new Date(client.user.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                {client.size && (
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{client.size} employees</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Engagements", value: client._count?.engagements ?? 0, icon: Briefcase, bg: "bg-violet-50", icon_color: "text-violet-500" },
              { label: "Bookings",    value: client._count?.bookings ?? 0,    icon: Calendar, bg: "bg-teal-50",   icon_color: "text-teal-500" },
            ].map(({ label, value, icon: Icon, bg, icon_color }) => (
              <div key={label} className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
                <div className="w-9 h-9 rounded-lg bg-white/60 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${icon_color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent engagements */}
          {client.engagements && client.engagements.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-2">Recent Engagements</p>
              <div className="space-y-2">
                {client.engagements.slice(0, 4).map(eng => (
                  <div key={eng.id}
                    className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{eng.company.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(eng.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <StagePill stage={eng.stage} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-slate-100">
            <a href={`/admin/matching?client=${client.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition">
              Match with Company
            </a>
            <a href={`/admin/engagements?client=${client.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
              <ExternalLink className="w-3.5 h-3.5" /> Engagements
            </a>
          </div>

        </div>
      )}
    </Modal>
  )
}
