"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Calendar, Briefcase, ArrowRight, Clock, Star, TrendingUp, Users, MessageSquare, Search, Filter, CheckCircle } from "lucide-react"
import Link from "next/link"
import { NeedsAssessmentModal } from "@/components/client/NeedsAssessmentModal"

interface Company {
  id: string
  name: string
  slug: string
  description: string | null
  fieldOfExpertise: string | null
  logo: string | null
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    engagements: 0,
    activeEngagements: 0,
    completedEngagements: 0,
    bookings: 0,
    messages: 0
  })
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    
    const fetchDashboardData = async () => {
      try {
        // Fetch engagements
        const engagementsRes = await fetch("/api/engagements")
        const engagementsData = await engagementsRes.json()
        
        if (engagementsData.success) {
          const engagements = engagementsData.engagements || []
          setStats({
            engagements: engagements.length,
            activeEngagements: engagements.filter((e: any) => e.stage === "ACTIVE").length,
            completedEngagements: engagements.filter((e: any) => e.stage === "COMPLETED").length,
            bookings: 0,
            messages: 0
          })
        }
        
        // Fetch companies for browsing
        const companiesRes = await fetch("/api/companies")
        const companiesData = await companiesRes.json()
        if (companiesData.success) {
          setRecentCompanies(companiesData.companies?.slice(0, 3) || [])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchDashboardData()
    }
  }, [status, router, session])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NeedsAssessmentModal />
      <div className="min-h-screen bg-slate-50">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="px-4 py-8 md:px-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold">
                  Welcome back, {session?.user?.name?.split(" ")[0] || "Client"}! 👋
                </h1>
                <p className="text-teal-100 mt-1">
                  Find specialist companies, book workspaces, and track your engagements.
                </p>
              </div>
              <Link
                href="/portal/client/profile"
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition text-sm font-medium"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Briefcase className="w-4 h-4" />
                Engagements
              </div>
              <p className="text-2xl font-bold text-navy-900">{stats.engagements}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Active
              </div>
              <p className="text-2xl font-bold text-navy-900">{stats.activeEngagements}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <CheckCircle className="w-4 h-4 text-teal-600" />
                Completed
              </div>
              <p className="text-2xl font-bold text-navy-900">{stats.completedEngagements}</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Bookings
              </div>
              <p className="text-2xl font-bold text-navy-900">{stats.bookings}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/portal/companies" className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition hover:-translate-y-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Find Companies</p>
                  <p className="text-xs text-slate-500">Browse specialist firms</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>

            <Link href="/portal/bookings" className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition hover:-translate-y-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Book a Space</p>
                  <p className="text-xs text-slate-500">Boardrooms & offices</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>

            <Link href="/portal/engagements" className="group bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition hover:-translate-y-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">View Engagements</p>
                  <p className="text-xs text-slate-500">Track your deals</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
            </Link>
          </div>

          {/* Recommended Companies */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-navy-900">Recommended for You</h2>
              <Link href="/portal/companies" className="text-sm text-teal-600 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentCompanies.length === 0 ? (
                <div className="col-span-3 text-center py-8 text-slate-400">No companies available yet</div>
              ) : (
                recentCompanies.map((company) => (
                  <Link key={company.id} href={`/portal/companies/${company.slug}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{company.name}</h3>
                        <p className="text-xs text-slate-500">{company.fieldOfExpertise || "Specialist Firm"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{company.description || "No description available"}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-6">
            <h3 className="font-semibold text-navy-900 mb-3">Getting Started</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Complete your needs assessment</p>
                  <p className="text-xs text-slate-500">Help us match you with the right partners</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Browse specialist companies</p>
                  <p className="text-xs text-slate-500">Find the right experts for your business needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Get matched and grow</p>
                  <p className="text-xs text-slate-500">Admin will match you with the right partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
