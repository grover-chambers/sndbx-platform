import type { Metadata } from "next"
import { DM_Sans, DM_Serif_Display } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "SNDBX Platform",
  description: "Business Ecosystem Operations Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
