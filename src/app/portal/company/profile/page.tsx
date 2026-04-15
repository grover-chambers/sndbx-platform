"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Building2, Globe, Save, Loader2, Clock, CheckCircle,
  Mail, Phone, MapPin, User, Bell, Users as UsersIcon,
  Camera, Award, TrendingUp, Image, Star,
  FolderOpen, Plus, Eye, UserCircle, Briefcase
} from "lucide-react"

type TabType = "rep" | "company" | "portfolio" | "testimonials" | "team"

export default function CompleteCompanyProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("rep")
  const [company, setCompany] = useState<any>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  
  // Rep Profile form
  const [repForm, setRepForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    image: ""
  })
  
  // Company form
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    fieldOfExpertise: "",
    website: "",
    logo: "",
    email: "",
    phone: "",
    location: "",
    foundedYear: "",
    teamSize: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }
    
    const fetchData = async () => {
      try {
        // Fetch company profile
        const companyRes = await fetch("/api/company/profile")
        const companyData = await companyRes.json()
        
        if (companyData.success && companyData.company) {
          setCompany(companyData.company)
          setCompanyForm({
            name: companyData.company.name || "",
            description: companyData.company.description || "",
            fieldOfExpertise: companyData.company.fieldOfExpertise || "",
            website: companyData.company.website || "",
            logo: companyData.company.logo || "",
            email: companyData.company.email || "",
            phone: companyData.company.phone || "",
            location: companyData.company.location || "",
            foundedYear: companyData.company.foundedYear || "",
            teamSize: companyData.company.teamSize || ""
          })
        }
        
        // Set rep profile from session
        if (session?.user) {
          setRepForm({
            name: session.user.name || "",
            email: session.user.email || "",
            phone: "",
            title: "",
            image: session.user.image || ""
          })
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchData()
    }
  }, [status, router, session])

  const handleRepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: repForm.name, image: repForm.image }),
      })

      if (res.ok) {
        await update({ name: repForm.name })
        setMessage({ type: "success", text: "Profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setSaving(false)
    }
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(companyForm),
      })

      if (res.ok) {
        setMessage({ type: "success", text: "Company profile updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update profile" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong" })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: "rep", label: "Rep Profile", icon: UserCircle },
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "testimonials", label: "Testimonials", icon: Star },
    { id: "team", label: "Team", icon: UsersIcon },
  ]

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Profile Settings</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your personal and company information</p>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-5xl">
        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-3 px-1 text-sm font-medium transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-teal-600 border-b-2 border-teal-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {message.text}
            </div>
          )}

          {/* Rep Profile Tab */}
          {activeTab === "rep" && (
            <form onSubmit={handleRepSubmit} className="space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center relative group">
                  <span className="text-2xl font-bold text-teal-600">
                    {repForm.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </span>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900">{repForm.name || "Your Name"}</h3>
                  <p className="text-sm text-slate-500">Company Representative</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={repForm.name}
                    onChange={(e) => setRepForm({ ...repForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={repForm.email}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={repForm.phone}
                    onChange={(e) => setRepForm({ ...repForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your direct line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={repForm.title}
                    onChange={(e) => setRepForm({ ...repForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Managing Director"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Company Info Tab */}
          {activeTab === "company" && (
            <form onSubmit={handleCompanySubmit} className="space-y-5">
              <div className="bg-teal-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-teal-800 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  This information is visible to clients browsing companies
                </p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 bg-teal-100 rounded-2xl flex items-center justify-center relative group">
                  {companyForm.logo ? (
                    <img src={companyForm.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <Building2 className="w-10 h-10 text-teal-600" />
                  )}
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white hover:bg-teal-700 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 text-xl">{companyForm.name}</h3>
                  <p className="text-sm text-slate-500">{companyForm.fieldOfExpertise || "Select expertise"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Field of Expertise *</label>
                  <select
                    value={companyForm.fieldOfExpertise}
                    onChange={(e) => setCompanyForm({ ...companyForm, fieldOfExpertise: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select expertise</option>
                    <option value="IT & Development">IT & Development</option>
                    <option value="Marketing & PR">Marketing & PR</option>
                    <option value="Design & Creative">Design & Creative</option>
                    <option value="Business Consulting">Business Consulting</option>
                    <option value="Legal Services">Legal Services</option>
                    <option value="Accounting & Tax">Accounting & Tax</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Description *</label>
                <textarea
                  rows={5}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Tell clients about your company..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="contact@..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={companyForm.phone}
                      onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="+254 ..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={companyForm.location}
                      onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg"
                      placeholder="Nairobi, Kenya"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Portfolio Tab - Simplified for now */}
          {activeTab === "portfolio" && (
            <div className="text-center py-8">
              <FolderOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Portfolio Coming Soon</h3>
              <p className="text-slate-500">Showcase your past work and case studies</p>
            </div>
          )}

          {/* Testimonials Tab - Simplified for now */}
          {activeTab === "testimonials" && (
            <div className="text-center py-8">
              <Star className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Testimonials Coming Soon</h3>
              <p className="text-slate-500">Collect and display client feedback</p>
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="text-center py-8">
              <UsersIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Invite Team Members</h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Invite colleagues to help manage your company profile
              </p>
              <div className="mt-6 max-w-md mx-auto">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <select className="px-3 py-2 border border-slate-200 rounded-lg">
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                    Invite
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Members can view engagements and respond to messages. Admins can also edit services.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
