"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Globe, Mail, Users, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  fieldOfExpertise: string | null
  website: string | null
  services: Array<{
    id: string
    title: string
    description: string | null
    pricing: string | null
  }>
  users: Array<{
    name: string | null
    email: string
  }>
}

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchCompany = async () => {
      try {
        const res = await fetch(`/api/companies/${params.slug}`)
        const data = await res.json()
        if (data.success) {
          setCompany(data.company)
        }
      } catch (error) {
        console.error("Failed to fetch company:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchCompany()
    }
  }, [status, router, session, params.slug])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading company details...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div>
        <div className="p-6">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Company not found</h3>
            <Link href="/portal/companies" className="text-teal-600 hover:underline">
              ← Back to Companies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-4 md:px-6">
          <Link href="/portal/companies" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Company Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center">
                <Building2 className="w-10 h-10 text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-navy-900 mb-2">{company.name}</h1>
                    {company.fieldOfExpertise && (
                      <span className="inline-flex items-center gap-1 text-sm bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {company.fieldOfExpertise}
                      </span>
                    )}
                  </div>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-3">About</h2>
              <p className="text-slate-600 leading-relaxed">{company.description}</p>
            </div>
          )}

          {/* Services */}
          {company.services && company.services.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Services Offered</h2>
              <div className="grid gap-4">
                {company.services.map((service) => (
                  <div key={service.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium text-slate-900 mb-1">{service.title}</h3>
                    {service.description && (
                      <p className="text-sm text-slate-500 mb-2">{service.description}</p>
                    )}
                    {service.pricing && (
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        {service.pricing}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {company.users && company.users.map((user, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{user.name || user.email}</span>
                </div>
              ))}
              {company.users && company.users.length > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${company.users[0].email}`} className="text-teal-600 hover:underline">
                    {company.users[0].email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
