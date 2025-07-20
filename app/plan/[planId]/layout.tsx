import type React from "react"

interface PlanLayoutProps {
  children: React.ReactNode
  params: { planId: string }
}

export default function PlanLayout({ children }: PlanLayoutProps) {
  return <>{children}</>
}
