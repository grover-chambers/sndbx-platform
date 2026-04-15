import Link from "next/link"
import { ArrowRight, Building2, Users, Calendar, Briefcase, Sparkles, Target, Award, Globe, CheckCircle, DollarSign } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-navy-900">SNDBX</span>
              <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Platform</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/companies" className="text-sm text-slate-600 hover:text-slate-900">Companies</Link>
              <Link href="/auth/register" className="text-sm text-slate-600 hover:text-slate-900">Join as Client</Link>
              <Link href="/auth/register?type=company" className="text-sm text-slate-600 hover:text-slate-900">List Your Company</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900">Sign In</Link>
              <Link href="/auth/register" className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-teal-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">Curated Ecosystem • Nairobi & Atlanta</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-navy-900 mb-6">
              The Digital Ecosystem to{" "}
              <span className="text-teal-600">Connect, Collaborate</span>
              <br />
              & Grow Your Business
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-8">
              An all-access pass to SNDBX's curated experts, premium workspaces, and powerful business tools—all in one seamless platform.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/auth/register" className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition inline-flex items-center gap-2">
                Join the Ecosystem <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/companies" className="px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition">
                Explore Specialist Firms
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-3xl font-bold text-teal-600">3500+</div><div className="text-sm text-slate-500 mt-1">SMEs Impacted</div></div>
            <div><div className="text-3xl font-bold text-teal-600">35+</div><div className="text-sm text-slate-500 mt-1">Subject Experts</div></div>
            <div><div className="text-3xl font-bold text-teal-600">5</div><div className="text-sm text-slate-500 mt-1">Branches</div></div>
            <div><div className="text-3xl font-bold text-teal-600">16</div><div className="text-sm text-slate-500 mt-1">Partners</div></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">Everything You Need in One Platform</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">From discovery to deal completion—we've built the tools to power your business growth within the SNDBX ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/companies" className="group bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-100 transition">
                <Building2 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Curated Expert Network</h3>
              <p className="text-sm text-slate-500">Access 35+ vetted, non-competing specialist firms across legal, HR, marketing, finance, and more.</p>
            </Link>
            <Link href="/portal/bookings" className="group bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-100 transition">
                <Calendar className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Workspace & Meeting Hub</h3>
              <p className="text-sm text-slate-500">Book premium boardrooms, offices, and meeting spaces on demand with real-time availability.</p>
            </Link>
            <div className="group bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Deal Facilitation Pipeline</h3>
              <p className="text-sm text-slate-500">From initial match to project completion, track every engagement stage in one place.</p>
            </div>
            <div className="group bg-white p-6 rounded-xl border border-slate-200">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Client & Partner Portal</h3>
              <p className="text-sm text-slate-500">A single dashboard to manage all your collaborations, documents, and communications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Simple steps to start growing your business with SNDBX</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold text-slate-900 mb-2">Create Account</h3>
              <p className="text-sm text-slate-500">Sign up as a client or company in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold text-slate-900 mb-2">Find Experts</h3>
              <p className="text-sm text-slate-500">Browse our curated list of specialist firms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold text-slate-900 mb-2">Connect & Collaborate</h3>
              <p className="text-sm text-slate-500">Get matched and start working together</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
              <h3 className="font-semibold text-slate-900 mb-2">Grow Your Business</h3>
              <p className="text-sm text-slate-500">Track progress and scale with support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Health Check Section */}
      <section className="py-20 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-3 py-1 mb-4">
                <Target className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-medium text-teal-700">Diagnostic Tool</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">SNDBX Business Health Check</h2>
              <p className="text-slate-600 mb-6">The health check is a diagnostic tool that can help you identify areas of your business that are performing well and areas that could use some improvement.</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-teal-600" /> Your sales performance</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-teal-600" /> Your entrepreneurial acumen</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-teal-600" /> Your product relevance</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle className="w-4 h-4 text-teal-600" /> Your start-up's investment potential</li>
              </ul>
              <Link href="/auth/register" className="px-6 py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition inline-flex items-center gap-2">
                Take the Health Check <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Get Your Snapshot</p>
                  <p className="text-xs text-slate-500">Results sent immediately</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">By asking a few questions, we will be able to present to you a snapshot of your business performance.</p>
              <div className="h-2 w-full bg-slate-100 rounded-full"><div className="w-2/3 h-2 bg-teal-600 rounded-full"></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy-900 mb-4">Our Ecosystem</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">The SNDBX ecosystem is designed to support entrepreneurs at every stage of their journey.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3"><Users className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-semibold text-slate-900 mb-2">Entrepreneur Support</h3>
              <p className="text-sm text-slate-500">Knowledge exchange and capacity building for SMEs.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-semibold text-slate-900 mb-2">Financing Subsidiary</h3>
              <p className="text-sm text-slate-500">Debt and equity financing for SMEs.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3"><Briefcase className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-semibold text-slate-900 mb-2">Joint Ventures</h3>
              <p className="text-sm text-slate-500">Value creation especially on Intellectual Property with SNDBX Experts.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3"><Globe className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-semibold text-slate-900 mb-2">Village Formula</h3>
              <p className="text-sm text-slate-500">Impact on social sector, youth, women, and green programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to grow your business within a supportive ecosystem?</h2>
          <p className="text-lg text-white/80 mb-8">Join 3500+ SMEs already growing with SNDBX</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gold-500 text-navy-900 font-semibold hover:bg-gold-400 transition">
              Get Started Today <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/companies" className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition">
              Explore Our Experts
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold">SNDBX</span>
                <span className="text-xs bg-teal-600 text-white px-2 py-0.5 rounded">Platform</span>
              </div>
              <p className="text-sm text-white/60">A curated ecosystem of 35+ specialist firms. Find the right partner, book premium workspaces, and grow your business.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/companies" className="hover:text-white transition">Companies</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition">Join as Client</Link></li>
                <li><Link href="/auth/register?type=company" className="hover:text-white transition">List Your Company</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/auth/register" className="hover:text-white transition">Health Check</Link></li>
                <li><Link href="/auth/register" className="hover:text-white transition">Get Started</Link></li>
                <li><Link href="/portal/support" className="hover:text-white transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">📍 Nairobi, Kenya</li>
                <li className="flex items-center gap-2">📍 Atlanta, USA</li>
                <li className="flex items-center gap-2">📧 hello@sndbx.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
            <p>&copy; {new Date().getFullYear()} SNDBX Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
