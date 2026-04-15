"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, Mail, Briefcase, Save, Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      })
      setLoading(false)
    }
  }, [status, router, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Profile Settings</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your account information</p>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-2xl">
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
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={session?.user?.role || "CLIENT"}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
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
