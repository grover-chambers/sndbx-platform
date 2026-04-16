"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

const SERVICE_TYPES = [
  "Legal Services", "Financial Advisory", "Marketing & Branding",
  "Technology & IT", "Business Consulting", "HR & Recruitment",
  "Accounting & Tax", "PR & Communications", "Design & Creative",
  "Operations & Logistics"
]

const STEPS = ["Business Info", "Service Needs", "Preferences", "Review & Submit"]

export default function NeedsAssessmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState(false)

  const [form, setForm] = useState({
    industry: "",
    companySize: "",
    revenueRange: "",
    serviceTypes: [] as string[],
    budgetRange: "",
    timeline: "",
    engagementType: "",
    locationPref: "",
    additionalContext: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login")
    if (status === "authenticated") fetchExisting()
  }, [status])

  const fetchExisting = async () => {
    const res = await fetch("/api/client/needs-assessment")
    const data = await res.json()
    if (data.assessment) {
      setExisting(true)
      setForm({
        industry: data.assessment.industry || "",
        companySize: data.assessment.companySize || "",
        revenueRange: data.assessment.revenueRange || "",
        serviceTypes: data.assessment.serviceTypes || [],
        budgetRange: data.assessment.budgetRange || "",
        timeline: data.assessment.timeline || "",
        engagementType: data.assessment.engagementType || "",
        locationPref: data.assessment.locationPref || "",
        additionalContext: data.assessment.additionalContext || ""
      })
    }
  }

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }))

  const toggleService = (service: string) => {
    setForm(f => ({
      ...f,
      serviceTypes: f.serviceTypes.includes(service)
        ? f.serviceTypes.filter(s => s !== service)
        : [...f.serviceTypes, service]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/client/needs-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setSaved(true)
        setTimeout(() => router.push("/portal/client/dashboard"), 2000)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Assessment Submitted!</h2>
          <p className="text-slate-500">
            {existing ? "Your needs have been updated." : "Admin has been notified and will match you shortly."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Needs Assessment</h1>
          <p className="text-slate-500">Help us match you with the right partners</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${
                i < step ? "bg-teal-500 text-white" :
                i === step ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                "bg-slate-200 text-slate-500"
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-1 w-16 sm:w-24 mx-1 rounded ${i < step ? "bg-teal-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">{STEPS[step]}</h2>

          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <select value={form.industry} onChange={e => update("industry", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select industry</option>
                  {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education", "Real Estate", "Media", "Agriculture", "Other"].map(i => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                <select value={form.companySize} onChange={e => update("companySize", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select size</option>
                  {["1-10", "11-50", "51-200", "201-500", "500+"].map(s => (
                    <option key={s} value={s}>{s} employees</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue Range</label>
                <select value={form.revenueRange} onChange={e => update("revenueRange", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select range</option>
                  {["Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$5M", "$5M-$20M", "Over $20M"].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 1: Service Needs */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Services Needed (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map(service => (
                    <button key={service} type="button" onClick={() => toggleService(service)}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-all border ${
                        form.serviceTypes.includes(service)
                          ? "bg-teal-50 border-teal-500 text-teal-700 font-medium"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}>
                      {service}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget Range</label>
                <select value={form.budgetRange} onChange={e => update("budgetRange", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select budget</option>
                  {["Under $5K", "$5K-$20K", "$20K-$50K", "$50K-$100K", "Over $100K"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Timeline</label>
                <select value={form.timeline} onChange={e => update("timeline", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select timeline</option>
                  {["ASAP", "Within 1 month", "1-3 months", "3-6 months", "6+ months"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Engagement Type</label>
                <select value={form.engagementType} onChange={e => update("engagementType", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select type</option>
                  {["One-time project", "Ongoing retainer", "Consulting", "Full service", "Advisory only"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location Preference</label>
                <select value={form.locationPref} onChange={e => update("locationPref", e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">Select preference</option>
                  {["Remote", "In-person", "Hybrid", "No preference"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Additional Context</label>
                <textarea value={form.additionalContext} onChange={e => update("additionalContext", e.target.value)}
                  rows={4} placeholder="Describe your challenge or what you're looking to achieve..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-4">
              {[
                { label: "Industry", value: form.industry },
                { label: "Company Size", value: form.companySize },
                { label: "Revenue Range", value: form.revenueRange },
                { label: "Services Needed", value: form.serviceTypes.join(", ") },
                { label: "Budget", value: form.budgetRange },
                { label: "Timeline", value: form.timeline },
                { label: "Engagement Type", value: form.engagementType },
                { label: "Location Preference", value: form.locationPref },
                { label: "Additional Context", value: form.additionalContext },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-medium text-slate-800 text-right max-w-xs">{value || "—"}</span>
                </div>
              ))}
              {!existing && (
                <p className="text-xs text-slate-400 mt-4">Admin will be notified to begin matching after submission.</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button onClick={() => step === 0 ? router.push("/portal/client/dashboard") : setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? "Back to Dashboard" : "Previous"}
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {existing ? "Update Assessment" : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
