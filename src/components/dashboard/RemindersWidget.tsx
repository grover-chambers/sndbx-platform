"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, Clock, Plus, X, Calendar } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  dueDate: string
  isCompleted: boolean
  relatedTo: string
}

export function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: ""
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders")
      const data = await res.json()
      if (data.success) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsComplete = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, { method: "PUT" })
      setReminders(reminders.filter(r => r.id !== id))
    } catch (error) {
      console.error("Failed to complete reminder:", error)
    }
  }

  const addReminder = async () => {
    if (!newReminder.title || !newReminder.dueDate) return
    
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReminder)
      })
      const data = await res.json()
      if (data.success) {
        setReminders([...reminders, data.reminder])
        setShowAddModal(false)
        setNewReminder({ title: "", description: "", dueDate: "" })
      }
    } catch (error) {
      console.error("Failed to add reminder:", error)
    }
  }

  const getDueStatus = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return { text: "Overdue", color: "text-red-600 bg-red-50" }
    if (days === 0) return { text: "Today", color: "text-amber-600 bg-amber-50" }
    if (days === 1) return { text: "Tomorrow", color: "text-blue-600 bg-blue-50" }
    return { text: `${days} days left`, color: "text-slate-600 bg-slate-50" }
  }

  if (loading) {
    return <div className="text-center py-4 text-sm text-slate-500">Loading reminders...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-navy-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-600" />
          Follow-up Reminders
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-xs text-teal-600 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-4">
          <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500">No pending reminders</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs text-teal-600 hover:underline mt-1"
          >
            Create a reminder →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => {
            const dueStatus = getDueStatus(reminder.dueDate)
            return (
              <div key={reminder.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                <button onClick={() => markAsComplete(reminder.id)} className="mt-0.5">
                  <CheckCircle className="w-4 h-4 text-slate-400 hover:text-green-500 transition" />
                </button>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{reminder.title}</p>
                  {reminder.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{reminder.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${dueStatus.color}`}>
                      {dueStatus.text}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(reminder.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-navy-900">Add Reminder</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Reminder title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <textarea
                placeholder="Description (optional)"
                rows={2}
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <input
                type="datetime-local"
                value={newReminder.dueDate}
                onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button onClick={addReminder} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Add Reminder</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
