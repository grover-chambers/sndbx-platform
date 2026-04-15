"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Building2, Search, Globe, Users, Filter, ArrowRight, MapPin, Mail, Phone } from "lucide-react"

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  fieldOfExpertise: string | null
  website: string | null
  email: string | null
  phone: string | null
  location: string | null
  status: string
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
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState<string>("")

  const expertiseOptions = [
    "All",
    "IT & Development",
    "Design & Creative",
    "Marketing & PR",
    "Legal Services",
    "Accounting & Tax",
    "Business Consulting",
    "Human Resources",
    "Other"
  ]

  useEffect(() => {
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
    
    fetchCompanies()
  }, [])

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (company.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesExpertise = !selectedExpertise || selectedExpertise === "All" || company.fieldOfExpertise === selectedExpertise
    return matchesSearch && matchesExpertise
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-12 md:px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Our Specialist Companies</h1>
          <p className="text-white/80 mt-2 max-w-2xl mx-auto">
            Browse our curated ecosystem of 35+ specialist firms ready to help your business grow
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {expertiseOptions.map(exp => (
              <button
                key={exp}
                onClick={() => setSelectedExpertise(exp === "All" ? "" : exp)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  (selectedExpertise === exp || (exp === "All" && !selectedExpertise))
                    ? "bg-teal-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {exp}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-slate-500 mb-4">
          Showing {filteredCompanies.length} of {companies.length} companies
        </p>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/companies/${company.slug}`}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg" />
                      ) : (
                        <Building2 className="w-6 h-6 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition">
                        {company.name}
                      </h3>
                      {company.fieldOfExpertise && (
                        <span className="inline-block text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full mt-1">
                          {company.fieldOfExpertise}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {company.description || "No description provided"}
                  </p>
                  
                  {company.services && company.services.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {company.services.slice(0, 2).map((service) => (
                          <span
                            key={service.id}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                          >
                            {service.title}
                          </span>
                        ))}
                        {company.services.length > 2 && (
                          <span className="text-xs text-slate-400">
                            +{company.services.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Users className="w-3 h-3" />
                      <span>{company.users?.length || 0} reps</span>
                    </div>
                    <span className="text-teal-600 text-sm font-medium group-hover:underline flex items-center gap-1">
                      View Profile <ArrowRight className="w-3 h-3" />
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
