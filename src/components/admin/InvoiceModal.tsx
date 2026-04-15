"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, Plus, Trash2, DollarSign, Calendar, FileText } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { formatKES } from "@/lib/invoiceUtils"

interface LineItem { description: string; amount: number }

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editInvoice?: any
  prefillEngagementId?: string
  prefillBookingId?: string
}

export function InvoiceModal({ isOpen, onClose, onSave, editInvoice, prefillEngagementId, prefillBookingId }: InvoiceModalProps) {
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [invoiceType, setInvoiceType] = useState<"booking" | "engagement" | "other">("other")
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", amount: 0 }])
  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    notes: "",
    engagementId: prefillEngagementId || "",
    bookingId: prefillBookingId || "",
  })

  useEffect(() => {
    if (isOpen) fetchClients()
  }, [isOpen])

  useEffect(() => {
    if (formData.clientId) {
      const c = clients.find(c => c.id === formData.clientId)
      setSelectedClient(c || null)
    } else {
      setSelectedClient(null)
    }
  }, [formData.clientId, clients])

  const fetchClients = async () => {
    const res = await fetch("/api/admin/clients?limit=100")
    const data = await res.json()
    setClients(data.clients || [])
  }

  const totalAmount = lineItems.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  const addLineItem = () => setLineItems([...lineItems, { description: "", amount: 0 }])
  const removeLineItem = (idx: number) => setLineItems(lineItems.filter((_, i) => i !== idx))
  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/financials/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: totalAmount,
          lineItems,
          type: invoiceType,
        })
      })
      if (res.ok) { onSave(); onClose() }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Invoice type */}
        <div className="flex gap-2">
          {(["booking","engagement","other"] as const).map(t => (
            <button key={t} type="button" onClick={() => setInvoiceType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                invoiceType === t ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}>{t}</button>
          ))}
        </div>

        {/* Client selector */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Bill To</label>
          <select required value={formData.clientId}
            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.companyName} — {c.user.email}</option>
            ))}
          </select>

          {selectedClient && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-x-6 gap-y-1">
              <div>
                <p className="text-xs text-slate-400">Company</p>
                <p className="text-sm font-medium text-slate-900">{selectedClient.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Contact</p>
                <p className="text-sm text-slate-700">{selectedClient.user.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-sm text-slate-700">{selectedClient.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Industry</p>
                <p className="text-sm text-slate-700">{selectedClient.industry || "—"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Due date */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Due Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" required value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        {/* Line items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Line Items</label>
            {invoiceType !== "booking" && (
              <button type="button" onClick={addLineItem}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
                <Plus className="w-3 h-3" /> Add item
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_140px_36px] text-xs font-medium text-slate-500 bg-slate-50 px-4 py-2 border-b border-slate-200">
              <span>Description</span><span className="text-right">Amount (KES)</span><span></span>
            </div>
            {lineItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_140px_36px] items-center px-4 py-2 border-b border-slate-100 last:border-b-0">
                <input value={item.description}
                  onChange={e => updateLineItem(idx, "description", e.target.value)}
                  placeholder="Service description..."
                  className="text-sm text-slate-800 bg-transparent focus:outline-none pr-4 w-full" />
                <input type="number" value={item.amount || ""}
                  onChange={e => updateLineItem(idx, "amount", e.target.value)}
                  placeholder="0"
                  className="text-sm text-right text-slate-800 bg-transparent focus:outline-none w-full" />
                {lineItems.length > 1 && (
                  <button type="button" onClick={() => removeLineItem(idx)}
                    className="flex justify-center text-slate-300 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-3 pr-4">
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-semibold text-teal-600">{formatKES(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Notes (optional)</label>
          <textarea rows={2} value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Payment instructions, terms, etc."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading || !formData.clientId || totalAmount === 0}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Create & Send Invoice
          </button>
        </div>
      </form>
    </Modal>
  )
}
