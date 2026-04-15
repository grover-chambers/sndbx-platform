"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Search, Globe, Users, Filter } from "lucide-react"
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

export default function CompaniesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState<string>("")

  const expertiseOptions = [
    "Legal Services",
    "Accounting & Tax",
    "IT & Development",
    "Marketing & PR",
    "Design & Creative",
    "Business Consulting",
    "Human Resources",
    "Other"
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies")
        const data = await res.json()
        if (data.success) {
          setCompanies(data.companies)
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchCompanies()
    }
  }, [status, router, session])

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesExpertise = !selectedExpertise || company.fieldOfExpertise === selectedExpertise
    return matchesSearch && matchesExpertise
  })

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-navy-900">Specialist Companies</h1>
          <p className="text-slate-500 mt-1 text-sm">Browse our curated ecosystem of specialist firms</p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedExpertise("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  !selectedExpertise
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {expertiseOptions.map(exp => (
                <button
                  key={exp}
                  onClick={() => setSelectedExpertise(exp)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedExpertise === exp
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/portal/companies/${company.slug}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition">
                          {company.name}
                        </h3>
                        {company.fieldOfExpertise && (
                          <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {company.fieldOfExpertise}
                          </span>
                        )}
                      </div>
                    </div>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-teal-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {company.description || "No description provided"}
                  </p>
                  
                  {company.services && company.services.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Key Services</p>
                      <div className="flex flex-wrap gap-2">
                        {company.services.slice(0, 3).map((service) => (
                          <span
                            key={service.id}
                            className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded"
                          >
                            {service.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Users className="w-3 h-3" />
                      <span>{company.users?.length || 0} representatives</span>
                    </div>
                    <span className="text-teal-600 text-sm font-medium group-hover:underline">
                      View Profile →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
