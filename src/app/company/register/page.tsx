"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Building2, Globe, FileText, Users, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CompanyRegistrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    website: "",
    description: "",
    fieldOfExpertise: "",
    services: [{ title: "", description: "", pricing: "" }],
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    
    // Auto-generate slug from name
    if (e.target.name === "name") {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setFormData({ ...formData, services: updatedServices })
  }

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { title: "", description: "", pricing: "" }]
    })
  }

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index)
      setFormData({ ...formData, services: updatedServices })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/company/registration-success")
      } else {
        const error = await response.json()
        alert(error.error || "Something went wrong")
      }
    } catch (error) {
      alert("Failed to register company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold text-navy-900">SNDBX</span>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-navy-900 mb-2">
            Register Your Company
          </h1>
          <p className="text-slate-500">
            Join the curated ecosystem of specialist firms
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s ? "bg-teal-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 px-2">
            <span>Basic Info</span>
            <span className="ml-8">Services</span>
            <span className="ml-8">Review</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Creative Agency Ltd"
                  />
                </div>

                <div>
                  <label className="form-label">Company Slug (URL) *</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    value={formData.slug}
                    onChange={handleChange}
                    className="form-input bg-slate-50"
                    placeholder="e.g., creative-agency"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    sndbx.com/companies/{formData.slug || "your-slug"}
                  </p>
                </div>

                <div>
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="form-label">Field of Expertise *</label>
                  <select
                    name="fieldOfExpertise"
                    required
                    value={formData.fieldOfExpertise}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select expertise</option>
                    <option value="Legal">Legal Services</option>
                    <option value="Accounting">Accounting & Tax</option>
                    <option value="IT & Development">IT & Development</option>
                    <option value="Marketing">Marketing & PR</option>
                    <option value="Design">Design & Creative</option>
                    <option value="Consulting">Business Consulting</option>
                    <option value="HR">Human Resources</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Describe what your company does, your expertise, and what makes you unique..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Next: Add Services <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900 mb-1">Your Services</h3>
                  <p className="text-sm text-slate-500">List the services you offer to clients</p>
                </div>

                {formData.services.map((service, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-slate-700">Service #{index + 1}</h4>
                      {formData.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="form-label text-xs">Service Title *</label>
                      <input
                        type="text"
                        required
                        value={service.title}
                        onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                        className="form-input"
                        placeholder="e.g., Brand Strategy"
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Description</label>
                      <textarea
                        rows={2}
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                        className="form-input"
                        placeholder="Brief description of this service..."
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Pricing (Optional)</label>
                      <input
                        type="text"
                        value={service.pricing}
                        onChange={(e) => handleServiceChange(index, "pricing", e.target.value)}
                        className="form-input"
                        placeholder="e.g., $500/day or Project-based"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addService}
                  className="btn-outline w-full justify-center"
                >
                  + Add Another Service
                </button>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-primary"
                  >
                    Review Application <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Review Your Information</h3>
                  <p className="text-sm text-slate-500">Please review before submitting for approval</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-navy-900">Company Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-500">Name:</span>
                    <span className="text-slate-900 font-medium">{formData.name}</span>
                    <span className="text-slate-500">Slug:</span>
                    <span className="text-slate-900 font-medium">{formData.slug}</span>
                    <span className="text-slate-500">Expertise:</span>
                    <span className="text-slate-900 font-medium">{formData.fieldOfExpertise}</span>
                    {formData.website && (
                      <>
                        <span className="text-slate-500">Website:</span>
                        <span className="text-slate-900 font-medium">{formData.website}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-navy-900 mb-2">Services ({formData.services.length})</h4>
                  <div className="space-y-3">
                    {formData.services.map((service, i) => (
                      <div key={i} className="border-b border-slate-200 pb-2 last:border-0">
                        <p className="font-medium text-slate-900">{service.title || "Untitled"}</p>
                        {service.description && (
                          <p className="text-xs text-slate-500 mt-1">{service.description}</p>
                        )}
                        {service.pricing && (
                          <p className="text-xs text-teal-600 mt-1">💰 {service.pricing}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Your application will be reviewed by our team before your company is listed publicly.
                    You'll receive an email notification once approved.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
