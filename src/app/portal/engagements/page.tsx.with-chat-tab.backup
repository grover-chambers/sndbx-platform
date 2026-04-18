"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Briefcase, Clock, CheckCircle, MessageCircle, Calendar, Users, TrendingUp, Filter } from "lucide-react"
import Link from "next/link"

interface Engagement {
  id: string
  stage: string
  dealValue: number | null
  notes: string | null
  startedAt: string
  completedAt: string | null
  client: {
    companyName: string
  }
  company: {
    name: string
    slug: string
  }
  timeline: Array<{
    id: string
    stage: string
    note: string | null
    createdAt: string
  }>
}

const stageConfig: Record<string, { label: string; color: string; icon: any }> = {
  MATCHED: { label: "Matched", color: "bg-blue-100 text-blue-700", icon: Users },
  PROPOSAL: { label: "Proposal", color: "bg-amber-100 text-amber-700", icon: MessageCircle },
  ACTIVE: { label: "Active", color: "bg-green-100 text-green-700", icon: TrendingUp },
  COMPLETED: { label: "Completed", color: "bg-teal-100 text-teal-700", icon: CheckCircle },
  ARCHIVED: { label: "Archived", color: "bg-slate-100 text-slate-600", icon: Clock }
}

export default function EngagementsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStage, setFilterStage] = useState<string>("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchEngagements = async () => {
      try {
        const res = await fetch("/api/engagements")
        const data = await res.json()
        if (data.success) {
          setEngagements(data.engagements)
        }
      } catch (error) {
        console.error("Failed to fetch engagements:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchEngagements()
    }
  }, [status, router, session])

  const filteredEngagements = filterStage
    ? engagements.filter(e => e.stage === filterStage)
    : engagements

  const getStageIcon = (stage: string) => {
    const config = stageConfig[stage]
    const Icon = config?.icon || Briefcase
    return <Icon className="w-4 h-4" />
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading engagements...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: engagements.length,
    active: engagements.filter(e => e.stage === "ACTIVE").length,
    completed: engagements.filter(e => e.stage === "COMPLETED").length,
    proposal: engagements.filter(e => e.stage === "PROPOSAL").length
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Engagements</h1>
          <p className="text-slate-500 mt-1 text-sm">Track your active deals and projects</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-bold text-navy-900">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Engagements</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-xs text-slate-500">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-bold text-amber-600">{stats.proposal}</p>
            <p className="text-xs text-slate-500">Proposal Stage</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStage("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                !filterStage
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {Object.entries(stageConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setFilterStage(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  filterStage === key
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Engagements List */}
        {filteredEngagements.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No engagements found</h3>
            <p className="text-slate-500">
              {session?.user?.role === "CLIENT" 
                ? "When you match with a company, your engagements will appear here"
                : "No engagements to display"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEngagements.map((engagement) => {
              const StageIcon = stageConfig[engagement.stage]?.icon || Briefcase
              return (
                <div key={engagement.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition">
                  <div className="p-6">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {engagement.company?.name || "Unknown Company"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Client: {engagement.client?.companyName || "Unknown Client"}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${stageConfig[engagement.stage]?.color || "bg-slate-100"}`}>
                        {getStageIcon(engagement.stage)}
                        {stageConfig[engagement.stage]?.label || engagement.stage}
                      </div>
                    </div>

                    {engagement.dealValue && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">Deal Value: <span className="font-semibold text-navy-900">${engagement.dealValue.toLocaleString()}</span></p>
                      </div>
                    )}

                    {engagement.notes && (
                      <p className="text-sm text-slate-600 mb-4">{engagement.notes}</p>
                    )}

                    {/* Timeline */}
                    {engagement.timeline && engagement.timeline.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Recent Updates</p>
                        <div className="space-y-2">
                          {engagement.timeline.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-start gap-2 text-xs">
                              <Clock className="w-3 h-3 text-slate-400 mt-0.5" />
                              <span className="text-slate-600">
                                {item.note || `Stage updated to ${stageConfig[item.stage]?.label || item.stage}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        Started: {new Date(engagement.startedAt).toLocaleDateString()}
                      </p>
                      <Link
                        href={`/portal/engagements/${engagement.id}`}
                        className="text-teal-600 text-sm font-medium hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
