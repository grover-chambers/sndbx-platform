"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, Users, Phone, MapPin, Edit2, Save, X, FileText, Building2, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  date: Date
  time: string
  clientName: string
  type: "meeting" | "call" | "deadline" | "booking"
  description?: string
  notes?: string
  location?: string
  spaceName?: string
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  space: { name: string }
  client: { companyName: string }
  status: string
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState("")
  const [loading, setLoading] = useState(true)
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "Client Discovery Call",
      date: new Date(),
      time: "10:00 AM",
      clientName: "TechCorp Kenya",
      type: "call",
      notes: "Discussed project requirements. Client needs e-commerce platform by Q3."
    },
    {
      id: "2",
      title: "Project Kickoff Meeting",
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      time: "2:00 PM",
      clientName: "Creative Agency",
      type: "meeting",
      location: "Boardroom A",
      notes: "Prepare contract and NDA."
    }
  ])

  // Fetch room bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings")
        const data = await res.json()
        if (data.success && data.bookings) {
          const bookingEvents: Event[] = data.bookings
            .filter((b: Booking) => b.status === "CONFIRMED")
            .map((b: Booking) => ({
              id: `booking-${b.id}`,
              title: `Room Booking: ${b.space.name}`,
              date: new Date(b.startTime),
              time: new Date(b.startTime).toLocaleTimeString(),
              clientName: b.client.companyName,
              type: "booking",
              location: b.space.name,
              spaceName: b.space.name,
              notes: `Booked from ${new Date(b.startTime).toLocaleTimeString()} to ${new Date(b.endTime).toLocaleTimeString()}`
            }))
          setEvents(prev => [...prev, ...bookingEvents])
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchBookings()
    }
  }, [session])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => event.date.toDateString() === date.toDateString())
  }

  const saveNotes = () => {
    if (selectedEvent) {
      setEvents(events.map(e => 
        e.id === selectedEvent.id ? { ...e, notes: notesText } : e
      ))
      setEditingNotes(false)
    }
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Schedule</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage meetings, calls, and room bookings</p>
          </div>
          <button
            onClick={() => setShowEventModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-navy-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} 
                  className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayEvents = day ? getEventsForDate(day) : []
                const isToday = day && day.toDateString() === new Date().toDateString()
                
                return (
                  <button
                    key={index}
                    onClick={() => day && dayEvents[0] && setSelectedEvent(dayEvents[0])}
                    className={`min-h-[100px] p-2 border border-slate-100 rounded-lg hover:bg-slate-50 transition text-left ${
                      isToday ? "bg-teal-50 border-teal-200" : ""
                    }`}
                  >
                    {day && (
                      <>
                        <span className={`text-sm ${isToday ? "font-bold text-teal-600" : "text-slate-600"}`}>
                          {day.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className={`text-xs p-1 rounded truncate ${
                              event.type === "booking" ? "bg-purple-100 text-purple-700" :
                              event.type === "meeting" ? "bg-blue-100 text-blue-700" :
                              event.type === "call" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {event.type === "booking" ? <Building2 className="w-3 h-3 inline mr-1" /> : null}
                              {event.title.length > 25 ? event.title.substring(0, 25) + "..." : event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-slate-400">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            {selectedEvent ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-navy-900">Event Details</h3>
                  <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{selectedEvent.title}</p>
                    <p className="text-sm text-slate-500">{selectedEvent.clientName}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{selectedEvent.date.toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{selectedEvent.time}</span>
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                  
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    selectedEvent.type === "meeting" ? "bg-blue-100 text-blue-700" :
                    selectedEvent.type === "call" ? "bg-green-100 text-green-700" :
                    selectedEvent.type === "booking" ? "bg-purple-100 text-purple-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedEvent.type === "meeting" ? <Users className="w-3 h-3" /> :
                     selectedEvent.type === "call" ? <Phone className="w-3 h-3" /> :
                     selectedEvent.type === "booking" ? <Building2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h4>
                    {!editingNotes && selectedEvent.type !== "booking" && (
                      <button onClick={() => {
                        setNotesText(selectedEvent.notes || "")
                        setEditingNotes(true)
                      }} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                        <Edit2 className="w-3 h-3" />
                        Edit Notes
                      </button>
                    )}
                  </div>
                  
                  {editingNotes ? (
                    <div className="space-y-3">
                      <textarea
                        rows={6}
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        placeholder="Add notes about this meeting..."
                      />
                      <div className="flex gap-2">
                        <button onClick={saveNotes} className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-1">
                          <Save className="w-3 h-3" />
                          Save Notes
                        </button>
                        <button onClick={() => setEditingNotes(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-3 min-h-[100px]">
                      {selectedEvent.notes ? (
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedEvent.notes}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">
                          {selectedEvent.type === "booking" 
                            ? "This is a room booking. Notes can be added to meetings and calls."
                            : "No notes yet. Click Edit Notes to add meeting minutes."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">Select an event to view details</p>
                <p className="text-xs text-slate-400 mt-1">Click on any event in the calendar</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">Schedule Event</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Event Title" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <input type="text" placeholder="Client Name" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="meeting">Meeting</option>
                <option value="call">Phone Call</option>
                <option value="deadline">Deadline</option>
              </select>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <input type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <input type="text" placeholder="Location (optional)" className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <textarea placeholder="Notes (optional)" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg" />
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowEventModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
