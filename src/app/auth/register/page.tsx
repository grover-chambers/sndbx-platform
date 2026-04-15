"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, useSession } from "next-auth/react"
import { Building2, User, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CLIENT" as "CLIENT" | "COMPANY_REP",
    companyName: "",
    companySlug: ""
  })

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role
      if (role === "SUPER_ADMIN" || role === "ADMIN") {
        router.push("/admin/dashboard")
      } else if (role === "COMPANY_REP") {
        router.push("/portal/company/dashboard")
      } else if (role === "CLIENT") {
        router.push("/portal/client/dashboard")
      } else {
        router.push("/portal/dashboard")
      }
    }
  }, [status, session, router])

  const handleCompanyNameChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    setFormData({ ...formData, companyName: value, companySlug: slug })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      if (formData.role === "COMPANY_REP") {
        if (!formData.companyName) {
          setError("Company name is required")
          setLoading(false)
          return
        }
        payload.companyName = formData.companyName
        payload.companySlug = formData.companySlug
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        setLoading(false)
        return
      }

      // Sign in after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but login failed. Please try logging in manually.")
        router.push("/auth/login")
      } else {
        // Let the useEffect handle redirect
        setLoading(false)
      }
    } catch (err) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-navy-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Join the SNDBX ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">I am a... *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "CLIENT" })}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  formData.role === "CLIENT"
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <span className="text-sm font-medium">Client</span>
                <p className="text-xs text-slate-500 mt-1">Looking for services</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "COMPANY_REP" })}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  formData.role === "COMPANY_REP"
                    ? "border-teal-600 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <Building2 className="w-6 h-6 mx-auto mb-2 text-slate-600" />
                <span className="text-sm font-medium">Company</span>
                <p className="text-xs text-slate-500 mt-1">Offering services</p>
              </button>
            </div>
          </div>

          {formData.role === "COMPANY_REP" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company URL</label>
                <input
                  type="text"
                  value={formData.companySlug}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-400 mt-1">sndbx.com/companies/{formData.companySlug || "your-company"}</p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-teal-600 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
