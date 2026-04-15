"use client"

import { Users, ArrowRight } from "lucide-react"

export default function AdminMatchingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Client-Company Matching</h1>
          <p className="text-slate-500 mt-1 text-sm">Match clients with specialist companies</p>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-500">Matching interface is being built. Check back soon!</p>
        </div>
      </div>
    </div>
  )
}
