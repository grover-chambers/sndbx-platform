"use client"

import { Users } from "lucide-react"

export default function AdminClientsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Manage Clients</h1>
          <p className="text-slate-500 mt-1 text-sm">View and manage client accounts</p>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-500">Client management is being built. Check back soon!</p>
        </div>
      </div>
    </div>
  )
}
