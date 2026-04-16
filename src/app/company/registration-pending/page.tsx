"use client"

import Link from "next/link"
import { Clock, Calendar, Mail, CheckCircle } from "lucide-react"

export default function RegistrationPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-navy-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-500 mb-6">
            Thank you for registering your company. Our team will review your application and contact you to schedule an interview.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-teal-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Document Review</p>
                  <p className="text-xs text-slate-500">Admin reviews your verification documents</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-teal-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Interview Scheduling</p>
                  <p className="text-xs text-slate-500">Admin will contact you to schedule an interview</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-teal-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Final Approval</p>
                  <p className="text-xs text-slate-500">Once approved, you'll get full platform access</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
