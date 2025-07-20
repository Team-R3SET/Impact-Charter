import { getBusinessPlan } from "@/lib/airtable"
import { BusinessPlanEditor } from "@/components/business-plan-editor"
import { PlanRoom } from "@/components/plan-room"

interface PlanPageProps {
  params: { planId: string }
  searchParams: Record<string, string | string[]>
}

export default async function PlanPage({ params, searchParams }: PlanPageProps) {
  // Attempt to load from Airtable (or fallback handled inside)
  const plan = await getBusinessPlan(params.planId)

  // Use query-string name when Airtable returns placeholder
  const derivedName =
    plan?.planName === "Untitled Plan"
      ? typeof searchParams.name === "string"
        ? decodeURIComponent(searchParams.name)
        : "Untitled Plan"
      : plan!.planName

  // Replace with real auth in production
  const user = {
    name: "Demo User",
    email: "user@example.com",
  }

  return (
    <PlanRoom roomId={`plan-${params.planId}`} userName={user.name} userEmail={user.email}>
      <BusinessPlanEditor planId={params.planId} planName={derivedName} userEmail={user.email} />
    </PlanRoom>
  )
}
