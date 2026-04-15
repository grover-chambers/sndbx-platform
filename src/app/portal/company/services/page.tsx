"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Save, X, Loader2 } from "lucide-react"

interface Service {
  id: string
  title: string
  description: string | null
  pricing: string | null
}

export default function ServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricing: ""
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/company/services")
        const data = await res.json()
        if (data.success) {
          setServices(data.services)
        }
      } catch (error) {
        console.error("Failed to fetch services:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchServices()
    }
  }, [status, router, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingService 
        ? `/api/company/services/${editingService.id}`
        : "/api/company/services"
      
      const method = editingService ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        // Refresh services
        const fetchRes = await fetch("/api/company/services")
        const data = await fetchRes.json()
        if (data.success) {
          setServices(data.services)
        }
        setShowModal(false)
        setEditingService(null)
        setFormData({ title: "", description: "", pricing: "" })
      }
    } catch (error) {
      console.error("Failed to save service:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const res = await fetch(`/api/company/services/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error("Failed to delete service:", error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      title: service.title,
      description: service.description || "",
      pricing: service.pricing || ""
    })
    setShowModal(true)
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
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Services</h1>
            <p className="text-slate-500 mt-1 text-sm">Manage the services your company offers</p>
          </div>
          <button
            onClick={() => {
              setEditingService(null)
              setFormData({ title: "", description: "", pricing: "" })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {services.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Plus className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No services yet</h3>
            <p className="text-slate-500">Add your first service to start attracting clients</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Add Service
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg">{service.title}</h3>
                    {service.description && (
                      <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                    )}
                    {service.pricing && (
                      <p className="text-sm text-teal-600 mt-2 font-medium">{service.pricing}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-slate-400 hover:text-teal-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-900">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe what this service includes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pricing</label>
                  <input
                    type="text"
                    value={formData.pricing}
                    onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., $500/project or $100/hour"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingService ? "Update Service" : "Add Service")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
