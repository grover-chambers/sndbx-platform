"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ClipboardList, X } from "lucide-react"

export function NeedsAssessmentModal() {
  const [show, setShow] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/client/needs-assessment")
        const data = await res.json()
        if (!data.assessment || !data.assessment.isComplete) {
          setShow(true)
        }
      } catch (error) {
        console.error("Failed to check assessment:", error)
      }
    }
    check()
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to SNDBX!</h2>
          <p className="text-slate-500 mb-6">
            To get started, please complete a quick needs assessment so we can match you with the right partners.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/portal/client/needs-assessment")}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Complete Assessment
            </button>
            <button
              onClick={() => setShow(false)}
              className="w-full py-3 text-slate-500 hover:text-slate-700 text-sm transition-colors"
            >
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
