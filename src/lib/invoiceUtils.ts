export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `INV-${year}-${random}`
}

export function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount)
}
