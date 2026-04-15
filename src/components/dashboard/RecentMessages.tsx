"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Users, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  senderName: string
  senderCompany: string
  content: string
  timestamp: string
  isRead: boolean
}

export function RecentMessages() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    // Poll every 15 seconds for new messages
    const interval = setInterval(fetchMessages, 15000)
    return () => clearInterval(interval)
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages/recent")
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-slate-500">Loading messages...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-navy-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-600" />
          Recent Messages
        </h3>
        <Link href="/portal/company/messages" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-4">
          <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No recent messages</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.slice(0, 3).map((message) => (
            <Link
              key={message.id}
              href="/portal/company/messages"
              className={`flex items-start gap-2 p-2 rounded-lg transition ${
                !message.isRead ? "bg-teal-50 hover:bg-teal-100" : "hover:bg-slate-50"
              }`}
            >
              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-teal-600">
                  {message.senderName.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {message.senderName}
                  </p>
                  <p className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {getTimeAgo(message.timestamp)}
                  </p>
                </div>
                <p className="text-xs text-slate-500 truncate">{message.senderCompany}</p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{message.content}</p>
              </div>
              {!message.isRead && (
                <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
