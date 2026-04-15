"use client"

import { useState } from "react"
import { Printer, CheckCircle, Clock, AlertCircle, Loader2, Send } from "lucide-react"
import { formatKES } from "@/lib/invoiceUtils"

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: "Draft",             color: "#888780", bg: "#F1EFE8" },
  SENT:     { label: "Awaiting Payment",  color: "#854F0B", bg: "#FAEEDA" },
  PAID:     { label: "Paid",              color: "#0F6E56", bg: "#E1F5EE" },
  OVERDUE:  { label: "Overdue",           color: "#A32D2D", bg: "#FCEBEB" },
  CANCELLED:{ label: "Cancelled",         color: "#888780", bg: "#F1EFE8" },
}

export function InvoicePrintView({ invoice, isAdmin }: { invoice: any; isAdmin: boolean }) {
  const [mpesaCode, setMpesaCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const status = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT
  const isBooking = !!invoice.bookingId
  const dueDate = new Date(invoice.dueDate)
  const isOverdue = invoice.status === "SENT" && dueDate < new Date()

  const lineItems = invoice.bookingId
    ? [{
        description: `${invoice.booking.space.name} — ${invoice.booking.space.type.replace("_"," ")} booking`,
        amount: invoice.amount,
      }]
    : (invoice.lineItems || [{ description: "Professional services", amount: invoice.amount }])

  const submitMpesa = async () => {
    if (!mpesaCode.trim()) { setError("Please enter your M-Pesa transaction code"); return }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/financials/invoices/${invoice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpesaCode: mpesaCode.trim() })
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setError("Failed to submit. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      {/* Toolbar (screen only) */}
      <div className="max-w-3xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <p className="text-sm text-slate-500">Invoice {invoice.invoiceNumber}</p>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-900 transition">
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Invoice document */}
      <div
        id="invoice-doc"
        className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {/* Letterhead */}
        <div style={{ background: "#0F4C5C", padding: "32px 40px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{
                  width: "36px", height: "36px", background: "#1D9E75",
                  borderRadius: "8px", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "18px", fontWeight: "700",
                  color: "white", fontFamily: "sans-serif"
                }}>S</div>
                <span style={{ color: "white", fontSize: "22px", fontWeight: "700", fontFamily: "sans-serif", letterSpacing: "-0.5px" }}>SNDBX</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: "sans-serif", margin: 0 }}>
                Nairobi, Kenya · hello@sndbx.co · sndbx.co
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "sans-serif", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Invoice</p>
              <p style={{ color: "white", fontSize: "18px", fontWeight: "600", fontFamily: "sans-serif", margin: 0 }}>{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>

        {/* Teal accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #1D9E75, #0F6E56)" }} />

        {/* Meta row */}
        <div style={{ padding: "24px 40px", background: "#F8FAFB", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "32px" }}>
            <div>
              <p style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Issue Date</p>
              <p style={{ color: "#1E293B", fontSize: "13px", fontFamily: "sans-serif", margin: 0 }}>{new Date(invoice.createdAt).toLocaleDateString("en-KE", { day:"numeric", month:"long", year:"numeric" })}</p>
            </div>
            <div>
              <p style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Due Date</p>
              <p style={{ color: isOverdue ? "#A32D2D" : "#1E293B", fontSize: "13px", fontFamily: "sans-serif", margin: 0, fontWeight: isOverdue ? "600" : "400" }}>
                {dueDate.toLocaleDateString("en-KE", { day:"numeric", month:"long", year:"numeric" })}
                {isOverdue && " — Overdue"}
              </p>
            </div>
          </div>
          <div style={{
            background: status.bg, color: status.color,
            padding: "6px 14px", borderRadius: "20px",
            fontSize: "12px", fontFamily: "sans-serif", fontWeight: "600"
          }}>
            {status.label}
          </div>
        </div>

        {/* Bill To / From */}
        <div style={{ padding: "32px 40px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
          <div>
            <p style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Billed To</p>
            <p style={{ color: "#1E293B", fontSize: "16px", fontWeight: "700", fontFamily: "sans-serif", margin: "0 0 4px" }}>{invoice.client.companyName}</p>
            <p style={{ color: "#475569", fontSize: "13px", fontFamily: "sans-serif", margin: "0 0 2px" }}>{invoice.client.user.name || "—"}</p>
            <p style={{ color: "#64748B", fontSize: "13px", fontFamily: "sans-serif", margin: "0 0 2px" }}>{invoice.client.user.email}</p>
            {invoice.client.industry && (
              <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "sans-serif", margin: "4px 0 0" }}>{invoice.client.industry}</p>
            )}
          </div>
          <div>
            <p style={{ color: "#94A3B8", fontSize: "11px", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Issued By</p>
            <p style={{ color: "#1E293B", fontSize: "16px", fontWeight: "700", fontFamily: "sans-serif", margin: "0 0 4px" }}>SNDBX Ltd</p>
            <p style={{ color: "#475569", fontSize: "13px", fontFamily: "sans-serif", margin: "0 0 2px" }}>hello@sndbx.co</p>
            <p style={{ color: "#64748B", fontSize: "13px", fontFamily: "sans-serif", margin: "0 0 2px" }}>Nairobi, Kenya</p>
            {invoice.user && (
              <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "sans-serif", margin: "4px 0 0" }}>Prepared by: {invoice.user.name}</p>
            )}
          </div>
        </div>

        {/* Line items table */}
        <div style={{ padding: "0 40px 32px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif" }}>
            <thead>
              <tr style={{ background: "#F1F5F9" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", borderRadius: "8px 0 0 8px" }}>Description</th>
                <th style={{ padding: "10px 16px", textAlign: "right", fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "600", borderRadius: "0 8px 8px 0" }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px", fontSize: "14px", color: "#334155" }}>{item.description}</td>
                  <td style={{ padding: "14px 16px", textAlign: "right", fontSize: "14px", color: "#334155" }}>{formatKES(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: "16px 16px 8px", fontFamily: "sans-serif" }}></td>
                <td style={{ padding: "16px 16px 8px", textAlign: "right" }}>
                  <p style={{ color: "#64748B", fontSize: "12px", fontFamily: "sans-serif", margin: "0 0 2px" }}>Total Due</p>
                  <p style={{ color: "#0F6E56", fontSize: "26px", fontWeight: "700", fontFamily: "sans-serif", margin: 0 }}>{formatKES(invoice.amount)}</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment instructions */}
        <div style={{ margin: "0 40px 32px", background: "#F0FDF9", border: "1px solid #9FE1CB", borderRadius: "12px", padding: "20px 24px" }}>
          <p style={{ color: "#0F6E56", fontSize: "12px", fontFamily: "sans-serif", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 12px" }}>Payment Instructions — M-Pesa</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {[
              { label: "Paybill Number", value: invoice.mpesaPaybill || "522533" },
              { label: "Account Number", value: invoice.mpesaAccNumber || invoice.invoiceNumber },
              { label: "Amount", value: formatKES(invoice.amount) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ color: "#5DCAA5", fontSize: "11px", fontFamily: "sans-serif", margin: "0 0 2px" }}>{label}</p>
                <p style={{ color: "#085041", fontSize: "15px", fontWeight: "700", fontFamily: "sans-serif", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
          <p style={{ color: "#0F6E56", fontSize: "11px", fontFamily: "sans-serif", margin: "14px 0 0", opacity: 0.7 }}>
            Use the invoice number as your M-Pesa account reference so we can match your payment.
          </p>
        </div>

        {/* Client M-Pesa submission (screen only, hidden from admin, hidden when paid) */}
        {!isAdmin && invoice.status !== "PAID" && !submitted && (
          <div className="print:hidden" style={{ margin: "0 40px 32px", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px 24px" }}>
            <p style={{ color: "#334155", fontSize: "14px", fontFamily: "sans-serif", fontWeight: "600", margin: "0 0 4px" }}>Already paid? Submit your M-Pesa code</p>
            <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "sans-serif", margin: "0 0 14px" }}>Enter the transaction code from your M-Pesa confirmation SMS to notify our team.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={mpesaCode}
                onChange={e => setMpesaCode(e.target.value.toUpperCase())}
                placeholder="e.g. QBZ4NXK8DF"
                style={{
                  flex: 1, padding: "10px 14px", border: "1px solid #CBD5E1",
                  borderRadius: "8px", fontSize: "14px", fontFamily: "monospace",
                  letterSpacing: "0.05em", color: "#1E293B", outline: "none"
                }}
              />
              <button onClick={submitMpesa} disabled={submitting}
                style={{
                  padding: "10px 20px", background: "#0F6E56", color: "white",
                  border: "none", borderRadius: "8px", fontSize: "13px",
                  fontFamily: "sans-serif", cursor: "pointer", display: "flex",
                  alignItems: "center", gap: "6px", opacity: submitting ? 0.6 : 1
                }}>
                {submitting ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Send style={{ width: 14, height: 14 }} />}
                Submit
              </button>
            </div>
            {error && <p style={{ color: "#A32D2D", fontSize: "12px", fontFamily: "sans-serif", marginTop: "8px" }}>{error}</p>}
          </div>
        )}

        {submitted && (
          <div className="print:hidden" style={{ margin: "0 40px 32px", background: "#E1F5EE", border: "1px solid #9FE1CB", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle style={{ width: 18, height: 18, color: "#0F6E56", flexShrink: 0 }} />
            <div>
              <p style={{ color: "#085041", fontSize: "13px", fontFamily: "sans-serif", fontWeight: "600", margin: 0 }}>Payment code submitted — thank you!</p>
              <p style={{ color: "#0F6E56", fontSize: "12px", fontFamily: "sans-serif", margin: "2px 0 0" }}>Our team will verify your payment and update this invoice shortly.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #E2E8F0", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "#CBD5E1", fontSize: "11px", fontFamily: "sans-serif", margin: 0 }}>SNDBX Ltd · Nairobi, Kenya</p>
          <p style={{ color: "#CBD5E1", fontSize: "11px", fontFamily: "sans-serif", margin: 0 }}>{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          #invoice-doc { box-shadow: none; max-width: 100%; }
        }
      `}</style>
    </div>
  )
}
