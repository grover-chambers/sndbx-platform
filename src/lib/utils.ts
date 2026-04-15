import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const STAGE_CONFIG = {
  MATCHED: { label: "Matched", bg: "bg-blue-50", color: "text-blue-700" },
  PROPOSAL: { label: "Proposal", bg: "bg-amber-50", color: "text-amber-700" },
  ACTIVE: { label: "Active", bg: "bg-green-50", color: "text-green-700" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50", color: "text-teal-700" },
  ARCHIVED: { label: "Archived", bg: "bg-slate-50", color: "text-slate-600" },
}

export const BOOKING_STATUS_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-amber-50", color: "text-amber-700" },
  CONFIRMED: { label: "Confirmed", bg: "bg-green-50", color: "text-green-700" },
  CANCELLED: { label: "Cancelled", bg: "bg-red-50", color: "text-red-700" },
  COMPLETED: { label: "Completed", bg: "bg-teal-50", color: "text-teal-700" },
}

export const INVOICE_STATUS_CONFIG = {
  DRAFT: { label: "Draft", bg: "bg-slate-50", color: "text-slate-600" },
  SENT: { label: "Sent", bg: "bg-blue-50", color: "text-blue-700" },
  PAID: { label: "Paid", bg: "bg-green-50", color: "text-green-700" },
  OVERDUE: { label: "Overdue", bg: "bg-red-50", color: "text-red-700" },
  CANCELLED: { label: "Cancelled", bg: "bg-slate-50", color: "text-slate-600" },
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin/dashboard"
    case "COMPANY_REP":
      return "/company/dashboard"
    case "CLIENT":
      return "/client/dashboard"
    default:
      return "/dashboard"
  }
}
