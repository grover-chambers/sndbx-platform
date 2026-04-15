"use client"

import { useState, useEffect } from "react"
import { Users, Clock, MessageSquare, Briefcase, UserPlus, Edit2 } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  memberName: string
  action: string
  timestamp: Date
  type: string
}

export function TeamActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/team/activity")
        const data = await res.json()
        if (data.success) {
          setActivities(data.activities)
        }
      } catch (error) {
        console.error("Failed to fetch team activity:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "service": return <Briefcase className="w-3 h-3" />
      case "message": return <MessageSquare className="w-3 h-3" />
      case "profile": return <Edit2 className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-slate-500">Loading team activity...</div>
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-4">
          <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No team activity yet</p>
          <Link href="/portal/company/profile?tab=team" className="text-xs text-teal-600 hover:underline mt-1 inline-block">
            Invite team members →
          </Link>
        </div>
      ) : (
        activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-lg transition">
            <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-teal-600">
                {activity.memberName.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-700">
                <span className="font-medium">{activity.memberName}</span> {activity.action}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                {getActivityIcon(activity.type)}
                {getTimeAgo(activity.timestamp)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
