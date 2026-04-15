"use client"

import { useState } from "react"
import { Loader2, Send, X, Building2, DollarSign, CreditCard } from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface PayoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  company: any
}

export function PayoutModal({ isOpen, onClose, onSave, company }: PayoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: company?.netPayable?.toString() || "",
    paymentMethod: "bank_transfer",
    reference: "",
    notes: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch("/api/admin/financials/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company?.id,
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      
      if (res.ok) {
        onSave()
        onClose()
      }
    } catch (error) {
      console.error("Failed to process payout:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!company) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Process Payout - ${company.name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-teal-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Net Payable Amount</span>
            <span className="text-2xl font-bold text-teal-600">KES {company.netPayable?.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mpesa">M-Pesa</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reference / Transaction ID</label>
          <input
            type="text"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., TRX-12345"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Additional notes..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Process Payment
          </button>
        </div>
      </form>
    </Modal>
  )
}
