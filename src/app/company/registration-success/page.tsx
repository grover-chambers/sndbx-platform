import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">
            Application Submitted!
          </h1>
          <p className="text-slate-500 mb-6">
            Thank you for registering your company. Our team will review your application
            and notify you via email once approved.
          </p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
