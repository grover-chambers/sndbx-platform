"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ClientDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-4">
            Client Dashboard
          </h1>
          <p className="text-slate-600">
            Welcome to your client portal. Here you'll be able to manage your engagements, book spaces, and more.
          </p>
        </div>
      </div>
    </div>
  )
}
