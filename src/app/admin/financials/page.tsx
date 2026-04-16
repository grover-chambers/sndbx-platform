"use client"

import { useState, useEffect } from "react"
import {
  DollarSign, TrendingUp, TrendingDown, Calendar,
  FileText, Smartphone, Percent, Send, Download,
  CheckCircle, XCircle, Clock, AlertCircle, Eye,
  Plus, RefreshCw, Search, Filter, ChevronLeft, ChevronRight,
  Edit2, Trash2
} from "lucide-react"
import { InvoiceModal } from "@/components/admin/InvoiceModal"
import { PayoutModal } from "@/components/admin/PayoutModal"
import { MpesaVerifyModal } from "@/components/admin/MpesaVerifyModal"

type TabType = "overview" | "invoices" | "mpesa" | "commissions" | "payouts"

interface RevenueData {
  totalRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  pendingPayments: number
  platformFees: number
  revenueGrowth: number
  bySource: Array<{ source: string; amount: number; percentage: number }>
  monthlyTrend: Array<{ month: string; revenue: number; bookings: number; commissions: number }>
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showMpesaModal, setShowMpesaModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [editingInvoice, setEditingInvoice] = useState<any>(null)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    try {
      const res = await fetch("/api/admin/financials/revenue")
      const data = await res.json()
      if (data.success) {
        setRevenueData(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "overview", label: "Revenue Overview", icon: DollarSign },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "mpesa", label: "M-Pesa", icon: Smartphone },
    { id: "commissions", label: "Commissions", icon: Percent },
    { id: "payouts", label: "Payouts", icon: Send },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(value)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="px-4 py-6 md:px-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Financial Overview</h1>
          <p className="text-white/80 mt-1 text-sm">Track revenue, manage invoices, and process payments</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-3 text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
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
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6">
        {activeTab === "overview" && (
          <RevenueOverview revenueData={revenueData} loading={loading} formatCurrency={formatCurrency} />
        )}
        {activeTab === "invoices" && (
          <InvoiceManagement 
            formatCurrency={formatCurrency} 
            onAddInvoice={() => {
              setEditingInvoice(null)
              setShowInvoiceModal(true)
            }}
            onEditInvoice={(invoice: any) => {
              setEditingInvoice(invoice)
              setShowInvoiceModal(true)
            }}
          />
        )}
        {activeTab === "mpesa" && (
          <MpesaManagement 
            formatCurrency={formatCurrency}
            onVerifyTransaction={(transaction: any) => {
              setSelectedTransaction(transaction)
              setShowMpesaModal(true)
            }}
          />
        )}
        {activeTab === "commissions" && (
          <CommissionManagement formatCurrency={formatCurrency} />
        )}
        {activeTab === "payouts" && (
          <PayoutManagement 
            formatCurrency={formatCurrency}
            onProcessPayout={(company: any) => {
              setSelectedCompany(company)
              setShowPayoutModal(true)
            }}
          />
        )}
      </div>

      {/* Modals */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false)
          setEditingInvoice(null)
        }}
        onSave={() => {
          fetchRevenueData()
          setShowInvoiceModal(false)
        }}
        editInvoice={editingInvoice}
      />

      <PayoutModal
        isOpen={showPayoutModal}
        onClose={() => {
          setShowPayoutModal(false)
          setSelectedCompany(null)
        }}
        onSave={() => {
          fetchRevenueData()
          setShowPayoutModal(false)
        }}
        company={selectedCompany}
      />

      <MpesaVerifyModal
        isOpen={showMpesaModal}
        onClose={() => {
          setShowMpesaModal(false)
          setSelectedTransaction(null)
        }}
        onSave={() => {
          fetchRevenueData()
          setShowMpesaModal(false)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}

// ==================== Revenue Overview Tab ====================
function RevenueOverview({ revenueData, loading, formatCurrency }: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!revenueData) return null

  const statCards = [
    { label: "Total Revenue", value: revenueData.totalRevenue, icon: DollarSign, color: "blue", change: "+23%" },
    { label: "Monthly Revenue", value: revenueData.monthlyRevenue, icon: TrendingUp, color: "green", change: "+12%" },
    { label: "Pending Payments", value: revenueData.pendingPayments, icon: Clock, color: "amber", change: "-5%" },
    { label: "Platform Fees", value: revenueData.platformFees, icon: Percent, color: "purple", change: "+8%" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 bg-${stat.color}-50 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${stat.color}-600`} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-navy-900">{formatCurrency(stat.value)}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-navy-900 mb-4">Revenue by Source</h3>
          <div className="space-y-3">
            {revenueData.bySource.map((source: any) => (
              <div key={source.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{source.source}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(source.amount)} ({source.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-600 rounded-full h-2" style={{ width: `${source.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-navy-900 mb-4">Monthly Trend</h3>
          <div className="space-y-3">
            {revenueData.monthlyTrend.slice(-6).map((trend: any) => (
              <div key={trend.month}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{trend.month}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(trend.revenue)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 rounded-full h-2" style={{ width: `${(trend.revenue / 200000) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== Invoice Management Tab ====================
function InvoiceManagement({ formatCurrency, onAddInvoice, onEditInvoice }: any) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/admin/financials/invoices")
      const data = await res.json()
      if (data.success) {
        setInvoices(data.invoices)
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "PAID": return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
      case "PENDING": return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
      case "OVERDUE": return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
      default: return <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Draft</span>
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search invoices..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-64" />
          </div>
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
        <button 
          onClick={onAddInvoice}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-teal-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Invoice #</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Client</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Due Date</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-mono text-slate-900">{inv.number}</td>
                <td className="px-5 py-3 text-slate-600">{inv.client}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{formatCurrency(inv.amount)}</td>
                <td className="px-5 py-3 text-slate-600">{inv.dueDate}</td>
                <td className="px-5 py-3">{getStatusBadge(inv.status)}</td>
                <td className="px-5 py-3 text-right">
                  <button 
                    onClick={() => onEditInvoice(inv)}
                    className="p-1 text-slate-400 hover:text-teal-600 mr-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:text-blue-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== M-Pesa Management Tab ====================
function MpesaManagement({ formatCurrency, onVerifyTransaction }: any) {
  const [settings, setSettings] = useState({
    paybillNumber: "",
    businessShortcode: "",
    passkey: ""
  })

  const pendingTransactions = [
    { id: "MP-001", amount: 7500, phone: "254712345678", date: "2024-03-15 14:30", status: "pending" },
    { id: "MP-002", amount: 15000, phone: "254798765432", date: "2024-03-15 10:15", status: "pending" },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-4">M-Pesa Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Paybill Number</label>
            <input
              type="text"
              value={settings.paybillNumber}
              onChange={(e) => setSettings({ ...settings, paybillNumber: e.target.value })}
              placeholder="123456"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Shortcode</label>
            <input
              type="text"
              value={settings.businessShortcode}
              onChange={(e) => setSettings({ ...settings, businessShortcode: e.target.value })}
              placeholder="123456"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Passkey</label>
          <input
            type="password"
            value={settings.passkey}
            onChange={(e) => setSettings({ ...settings, passkey: e.target.value })}
            placeholder="••••••••••••••••"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition">
            Test Connection
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition">
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-navy-900">Pending M-Pesa Transactions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingTransactions.map((tx) => (
            <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{tx.id}</p>
                <p className="text-xs text-slate-500">{tx.phone} • {tx.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(tx.amount)}</p>
                <button 
                  onClick={() => onVerifyTransaction(tx)}
                  className="text-xs text-green-600 hover:underline mt-1"
                >
                  Verify Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Commission Management Tab ====================
function CommissionManagement({ formatCurrency }: any) {
  const [commissionRate, setCommissionRate] = useState(10)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-navy-900 mb-4">Commission Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deal Commission Rate</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-teal-600 w-12">{commissionRate}%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Booking Processing Fee</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="10" step="0.5" defaultValue="5" className="flex-1" />
              <span className="text-lg font-semibold text-teal-600 w-12">5%</span>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition">
            Save Commission Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-navy-900">Commission Earned by Company</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Company</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Deals Closed</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Total Value</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Commission</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { company: "TechSolutions Kenya", deals: 12, value: 450000, commission: 45000, status: "pending" },
                { company: "Creative Studio", deals: 8, value: 320000, commission: 32000, status: "paid" },
                { company: "Legal Experts Ltd", deals: 5, value: 180000, commission: 18000, status: "pending" },
              ].map((c, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{c.company}</td>
                  <td className="px-5 py-3 text-slate-600">{c.deals}</td>
                  <td className="px-5 py-3 text-slate-600">{formatCurrency(c.value)}</td>
                  <td className="px-5 py-3 font-medium text-teal-600">{formatCurrency(c.commission)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==================== Payout Management Tab ====================
function PayoutManagement({ formatCurrency, onProcessPayout }: any) {
  const payouts = [
    { id: "1", name: "TechSolutions Kenya", earnings: 450000, commission: 45000, netPayable: 405000, status: "pending" },
    { id: "2", name: "Creative Studio", earnings: 320000, commission: 32000, netPayable: 288000, status: "paid" },
    { id: "3", name: "Legal Experts Ltd", earnings: 180000, commission: 18000, netPayable: 162000, status: "pending" },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Company</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Earnings</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Commission</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Net Payable</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-slate-500">Status</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                <td className="px-5 py-3 text-slate-600">{formatCurrency(p.earnings)}</td>
                <td className="px-5 py-3 text-slate-600">{formatCurrency(p.commission)}</td>
                <td className="px-5 py-3 font-semibold text-teal-600">{formatCurrency(p.netPayable)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {p.status === "pending" && (
                    <button 
                      onClick={() => onProcessPayout(p)}
                      className="px-3 py-1 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                      Process Payout
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
