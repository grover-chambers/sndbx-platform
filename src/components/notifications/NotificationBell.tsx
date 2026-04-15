"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, CheckCircle, XCircle, Calendar, Briefcase, MessageSquare, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSSENotifications } from "@/hooks/useSSENotifications"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { isConnected } = useSSENotifications()

  useEffect(() => {
    if (session) {
      fetchNotifications()
      // Poll every 30 seconds as backup
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, isRead: true })
      })
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }

  const markAllAsRead = async () => {
    for (const notification of notifications.filter(n => !n.isRead)) {
      await markAsRead(notification.id)
    }
  }

  const getIcon = (type: string) => {
    switch(type) {
      case "BOOKING_CONFIRMATION": return <Calendar className="w-4 h-4 text-green-500" />
      case "MATCH_ALERT": return <Briefcase className="w-4 h-4 text-blue-500" />
      case "MESSAGE": return <MessageSquare className="w-4 h-4 text-purple-500" />
      default: return <Bell className="w-4 h-4 text-slate-500" />
    }
  }

  const getTimeAgo = (date: string) => {
    const minutes = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return `${Math.floor(minutes / 1440)}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-teal-600 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                    !notification.isRead ? "bg-teal-50/30" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{getTimeAgo(notification.createdAt)}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
