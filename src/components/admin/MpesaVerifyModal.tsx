"use client"

import { useState } from "react"
import { Loader2, CheckCircle, XCircle, Smartphone, DollarSign, Calendar } from "lucide-react"
import { Modal } from "@/components/ui/Modal"

interface MpesaVerifyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  transaction: any
}

export function MpesaVerifyModal({ isOpen, onClose, onSave, transaction }: MpesaVerifyModalProps) {
  const [loading, setLoading] = useState(false)

  const handleVerify = async (status: "confirmed" | "rejected") => {
    setLoading(true)
    
    try {
      const res = await fetch(`/api/admin/financials/mpesa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: transaction?.id,
          status,
          amount: transaction?.amount
        })
      })
      
      if (res.ok) {
        onSave()
        onClose()
      }
    } catch (error) {
      console.error("Failed to verify transaction:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!transaction) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify M-Pesa Transaction" size="md">
      <div className="space-y-5">
        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Transaction ID</span>
            <span className="font-mono text-sm">{transaction.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Amount</span>
            <span className="font-semibold text-teal-600">KES {transaction.amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Phone Number</span>
            <span>{transaction.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Date</span>
            <span>{transaction.date}</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-sm text-amber-800">
            Please verify that the payment has been received before confirming.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => handleVerify("rejected")}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => handleVerify("confirmed")}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Confirm Payment
          </button>
        </div>
      </div>
    </Modal>
  )
}
