"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Mail, Building2, Save, Loader2, Camera } from "lucide-react"

export default function ClientProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    industry: "",
    size: ""
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    
    const fetchClient = async () => {
      try {
        const res = await fetch("/api/client/profile")
        const data = await res.json()
        if (data.success && data.client) {
          setClient(data.client)
          setFormData({
            name: session?.user?.name || "",
            email: session?.user?.email || "",
            companyName: data.client.companyName || "",
            industry: data.client.industry || "",
            size: data.client.size || ""
          })
        }
      } catch (error) {
        console.error("Failed to fetch client:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchClient()
    }
  }, [status, router, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      // Update user name
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name })
      })
      
      // Update client profile
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: formData.companyName,
          industry: formData.industry,
          size: formData.size
        })
      })

      if (res.ok) {
        await update({ name: formData.name })
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setSaving(false)
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
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">My Profile</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your personal and company information</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                {message.text}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  onClick={() => alert("Photo upload coming soon!")}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-md font-semibold text-navy-900 mb-4">Company Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Your company name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Creative & Design">Creative & Design</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
