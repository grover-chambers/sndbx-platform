"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, Plus, Edit2, Trash2, Calendar, Users, DollarSign, Clock, Loader2 } from "lucide-react"

interface Space {
  id: string
  name: string
  type: string
  capacity: number
  description: string
  hourlyRate: number
  dailyRate: number
  isActive: boolean
}

export default function AdminSpacesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState<Space | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "BOARDROOM",
    capacity: 10,
    description: "",
    hourlyRate: 50,
    dailyRate: 300,
    isActive: true
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    fetchSpaces()
  }, [status, router])

  const fetchSpaces = async () => {
    try {
      const res = await fetch("/api/spaces")
      const data = await res.json()
      if (data.success) {
        setSpaces(data.spaces)
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSpace ? `/api/spaces/${editingSpace.id}` : "/api/spaces"
      const method = editingSpace ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        fetchSpaces()
        setShowModal(false)
        setEditingSpace(null)
        setFormData({ name: "", type: "BOARDROOM", capacity: 10, description: "", hourlyRate: 50, dailyRate: 300, isActive: true })
      }
    } catch (error) {
      console.error("Failed to save space:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this space?")) return
    try {
      const res = await fetch(`/api/spaces/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchSpaces()
      }
    } catch (error) {
      console.error("Failed to delete space:", error)
    }
  }

  if (status === "loading" || loading) {
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
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Workspace Management</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage bookable rooms, boardrooms, and offices</p>
          </div>
          <button
            onClick={() => {
              setEditingSpace(null)
              setFormData({ name: "", type: "BOARDROOM", capacity: 10, description: "", hourlyRate: 50, dailyRate: 300, isActive: true })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Space
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">{space.name}</h3>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                      space.type === "BOARDROOM" ? "bg-purple-100 text-purple-700" :
                      space.type === "OFFICE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {space.type}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${space.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {space.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 mb-4">{space.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Up to {space.capacity} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${space.hourlyRate}/hr or ${space.dailyRate}/day</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingSpace(space)
                      setFormData({
                        name: space.name,
                        type: space.type,
                        capacity: space.capacity,
                        description: space.description,
                        hourlyRate: space.hourlyRate,
                        dailyRate: space.dailyRate,
                        isActive: space.isActive
                      })
                      setShowModal(true)
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(space.id)}
                    className="flex-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-navy-900 mb-4">{editingSpace ? "Edit Space" : "Add Space"}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Space Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" required />
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                <option value="BOARDROOM">Boardroom</option>
                <option value="OFFICE">Office</option>
                <option value="MEETING_ROOM">Meeting Room</option>
              </select>
              <input type="number" placeholder="Capacity" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" rows={3} />
              <input type="number" placeholder="Hourly Rate ($)" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" required />
              <input type="number" placeholder="Daily Rate ($)" value={formData.dailyRate} onChange={(e) => setFormData({ ...formData, dailyRate: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg" required />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">Active (visible for booking)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
