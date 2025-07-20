import { notFound } from "next/navigation"
import { getBusinessPlan } from "@/lib/airtable"
import { BusinessPlanEditor } from "@/components/business-plan-editor"
import { PlanRoom } from "@/components/plan-room"

interface PlanPageProps {
  params: { planId: string }
}

export default async function PlanPage({ params }: PlanPageProps) {
  const plan = await getBusinessPlan(params.planId)
  if (!plan) notFound()

  // Replace with real auth in production
  const user = {
    name: "Demo User",
    email: "user@example.com",
  }

  return (
    <PlanRoom roomId={`plan-${params.planId}`} userName={user.name} userEmail={user.email}>
      {/* BusinessPlanEditor is already a client component */}
      <BusinessPlanEditor planId={params.planId} planName={plan.planName} userEmail={user.email} />
    </PlanRoom>
  )
}
