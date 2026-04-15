"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Chrome, Github } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"CLIENT" | "COMPANY_REP">("CLIENT")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      setLoading(false)
    } else {
      // Sign in after successful registration
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif font-bold text-navy-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Or{" "}
            <Link href="/auth/login" className="font-medium text-teal-600 hover:text-teal-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="form-label">I am a...</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="CLIENT"
                    checked={role === "CLIENT"}
                    onChange={() => setRole("CLIENT")}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm text-slate-700">Client looking for services</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="COMPANY_REP"
                    checked={role === "COMPANY_REP"}
                    onChange={() => setRole("COMPANY_REP")}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm text-slate-700">Company representative</span>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="btn-outline justify-center"
            >
              <Chrome className="w-4 h-4" />
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="btn-outline justify-center"
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
