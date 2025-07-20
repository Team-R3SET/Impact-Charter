import type React from "react"
import { AppHeader } from "@/components/app-header"

interface PlanLayoutProps {
  children: React.ReactNode
  params: { planId: string }
}

export default function PlanLayout({ children, params }: PlanLayoutProps) {
  // TODO: Replace with real auth
  const currentUser = {
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  return (
    <>
      <AppHeader currentUser={currentUser} currentPlanId={params.planId} />
      {children}
    </>
  )
}
