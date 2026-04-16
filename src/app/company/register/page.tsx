"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, Upload, FileText, CheckCircle, XCircle, Loader2, ArrowRight, ArrowLeft, Briefcase, Globe, Mail, Phone, MapPin, Users } from "lucide-react"

type Step = "account" | "profile" | "documents" | "services" | "review"

interface Service {
  title: string
  description: string
  pricing: string
}

export default function CompanyRegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("account")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Account info
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  
  // Company profile
  const [profile, setProfile] = useState({
    name: "",
    slug: "",
    website: "",
    description: "",
    fieldOfExpertise: "",
    phone: "",
    location: "",
    teamSize: ""
  })
  
  // Documents (Cloudinary uploads)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState({
    businessCertUrl: "",
    taxComplianceUrl: "",
    professionalLicenseUrl: "",
    insuranceUrl: "",
    portfolioUrls: [] as string[]
  })
  
  // Services
  const [services, setServices] = useState<Service[]>([{ title: "", description: "", pricing: "" }])
  
  const expertiseOptions = [
    "IT & Development", "Design & Creative", "Marketing & PR",
    "Legal Services", "Accounting & Tax", "Business Consulting",
    "Human Resources", "Other"
  ]

  const uploadFile = async (file: File, type: string): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)
    
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })
    
    if (!res.ok) {
      throw new Error("Upload failed")
    }
    
    const data = await res.json()
    return data.url
  }

  const handleFileUpload = async (file: File | null, type: keyof typeof uploadedUrls) => {
    if (!file) return
    
    setUploading(true)
    try {
      const url = await uploadFile(file, type as string)
      
      if (type === "businessCertUrl") setUploadedUrls(prev => ({ ...prev, businessCertUrl: url }))
      else if (type === "taxComplianceUrl") setUploadedUrls(prev => ({ ...prev, taxComplianceUrl: url }))
      else if (type === "professionalLicenseUrl") setUploadedUrls(prev => ({ ...prev, professionalLicenseUrl: url }))
      else if (type === "insuranceUrl") setUploadedUrls(prev => ({ ...prev, insuranceUrl: url }))
      
    } catch (error) {
      console.error("Upload failed:", error)
      setError("Failed to upload file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handlePortfolioUpload = async (files: FileList) => {
    setUploading(true)
    try {
      const newUrls = [...uploadedUrls.portfolioUrls]
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i], "portfolio")
        newUrls.push(url)
      }
      setUploadedUrls(prev => ({ ...prev, portfolioUrls: newUrls }))
    } catch (error) {
      setError("Failed to upload portfolio files.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/companies/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account,
          profile,
          documents: uploadedUrls,
          services: services.filter(s => s.title)
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        router.push("/company/registration-pending")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const addService = () => {
    setServices([...services, { title: "", description: "", pricing: "" }])
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const stepOrder: Step[] = ["account", "profile", "documents", "services", "review"]
  const currentIndex = stepOrder.indexOf(step)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50/20 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepOrder.map((s, i) => {
              const isComplete = currentIndex > i
              const isActive = currentIndex === i
              
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                    isComplete ? "bg-teal-500 text-white" :
                    isActive ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                    "bg-slate-200 text-slate-500"
                  }`}>
                    {isComplete ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${isComplete ? "bg-teal-500" : "bg-slate-200"}`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>Account</span>
            <span>Profile</span>
            <span>Documents</span>
            <span>Services</span>
            <span>Review</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Account */}
        {step === "account" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">Create Account</h2>
            <p className="text-slate-500 mb-6">Set up your representative account</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => setAccount({ ...account, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => setAccount({ ...account, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  value={account.confirmPassword}
                  onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <button
                onClick={() => {
                  if (account.password !== account.confirmPassword) {
                    setError("Passwords do not match")
                    return
                  }
                  if (!account.name || !account.email || !account.password) {
                    setError("Please fill all fields")
                    return
                  }
                  setStep("profile")
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Company Profile */}
        {step === "profile" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">Company Profile</h2>
            <p className="text-slate-500 mb-6">Tell us about your company</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value })
                    setProfile(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") }))
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Slug (URL)</label>
                <input
                  type="text"
                  value={profile.slug}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-400 mt-1">sndbx.com/companies/{profile.slug || "your-company"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Field of Expertise *</label>
                <select
                  value={profile.fieldOfExpertise}
                  onChange={(e) => setProfile({ ...profile, fieldOfExpertise: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="">Select expertise</option>
                  {expertiseOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Description *</label>
                <textarea
                  rows={4}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tell us about your company, your mission, and what makes you unique..."
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("account")}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (!profile.name || !profile.fieldOfExpertise || !profile.description) {
                    setError("Please fill required fields")
                    return
                  }
                  setStep("documents")
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Documents - Simplified for now */}
        {step === "documents" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">Verification Documents</h2>
            <p className="text-slate-500 mb-6">Upload required documents for verification</p>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="businessCert"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "businessCertUrl")
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="businessCert" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    {uploadedUrls.businessCertUrl ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                        <p className="text-sm text-green-600">Business Registration uploaded</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-700">Business Registration Certificate *</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, or PNG (max 10MB)</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
                <input
                  type="file"
                  id="taxCompliance"
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "taxComplianceUrl")
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="taxCompliance" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    {uploadedUrls.taxComplianceUrl ? (
                      <>
                        <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                        <p className="text-sm text-green-600">Tax Compliance uploaded</p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 text-slate-400 mb-2" />
                        <p className="text-sm font-medium text-slate-700">Tax Compliance Certificate *</p>
                        <p className="text-xs text-slate-400 mt-1">Required for verification</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
            
            {uploading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span className="ml-2 text-sm text-slate-500">Uploading...</span>
              </div>
            )}
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("profile")}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (!uploadedUrls.businessCertUrl || !uploadedUrls.taxComplianceUrl) {
                    setError("Please upload Business Registration and Tax Compliance certificates")
                    return
                  }
                  setStep("services")
                }}
                disabled={uploading}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Services */}
        {step === "services" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">Your Services</h2>
            <p className="text-slate-500 mb-6">List the services your company offers</p>
            
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-900">Service #{index + 1}</h3>
                    {services.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeService(index)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Service Title"
                    value={service.title}
                    onChange={(e) => updateService(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <textarea
                    placeholder="Service Description"
                    rows={2}
                    value={service.description}
                    onChange={(e) => updateService(index, "description", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="text"
                    placeholder="Pricing (e.g., $500/project or $100/hour)"
                    value={service.pricing}
                    onChange={(e) => updateService(index, "pricing", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              ))}
              
              <button
                type="button"
                onClick={addService}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-teal-500 hover:text-teal-600 transition"
              >
                + Add Another Service
              </button>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("documents")}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep("review")}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === "review" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-navy-900 mb-2">Review Your Application</h2>
            <p className="text-slate-500 mb-6">Please review before submitting</p>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-navy-900 mb-2">Account Information</h3>
                <p className="text-sm"><span className="text-slate-500">Name:</span> {account.name}</p>
                <p className="text-sm"><span className="text-slate-500">Email:</span> {account.email}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-navy-900 mb-2">Company Information</h3>
                <p className="text-sm"><span className="text-slate-500">Name:</span> {profile.name}</p>
                <p className="text-sm"><span className="text-slate-500">Expertise:</span> {profile.fieldOfExpertise}</p>
                <p className="text-sm"><span className="text-slate-500">Location:</span> {profile.location || "Not specified"}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-navy-900 mb-2">Verification Documents</h3>
                <p className="text-sm text-green-600">✓ Business Registration uploaded</p>
                <p className="text-sm text-green-600">✓ Tax Compliance uploaded</p>
                {uploadedUrls.professionalLicenseUrl && <p className="text-sm text-green-600">✓ Professional License uploaded</p>}
                <p className="text-sm">📎 {uploadedUrls.portfolioUrls.length} portfolio items</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-navy-900 mb-2">Services ({services.filter(s => s.title).length})</h3>
                {services.filter(s => s.title).map((s, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                    {s.pricing && <p className="text-xs text-teal-600">{s.pricing}</p>}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                ⚠️ Your application will be reviewed by our team. You will be contacted for an interview.
                Once approved, you'll get full access to the platform.
              </p>
            </div>
            
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep("services")}
                className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Submit Application
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
