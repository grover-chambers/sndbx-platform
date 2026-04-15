"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "2xl"
}

const sizeMap = {
  sm:  "max-w-sm",
  md:  "max-w-md",
  lg:  "max-w-lg",
  xl:  "max-w-2xl",
  "2xl": "max-w-4xl",
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (isOpen) {
      document.addEventListener("keydown", handleKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className={`bg-white rounded-2xl w-full ${sizeMap[size]} max-h-[90vh] flex flex-col shadow-xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
