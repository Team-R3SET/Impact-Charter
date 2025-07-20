import { getBusinessPlan } from "@/lib/airtable"
import { BusinessPlanEditor } from "@/components/business-plan-editor"
import { PlanRoom } from "@/components/plan-room"
import { notFound } from "next/navigation"

interface PlanPageProps {
  params: { planId: string }
  searchParams: Record<string, string | string[]>
}

export default async function PlanPage({ params, searchParams }: PlanPageProps) {
  // Await the params and searchParams
  const { planId } = params
  const searchParamsResolved = searchParams

  // Validate planId
  if (!planId || typeof planId !== "string") {
    notFound()
  }

  try {
    // Attempt to load from Airtable (or fallback handled inside)
    const plan = await getBusinessPlan(planId)

    if (!plan) {
      notFound()
    }

    // Use query-string name when Airtable returns placeholder
    const derivedName =
      plan?.planName === "Untitled Plan"
        ? typeof searchParamsResolved.name === "string"
          ? decodeURIComponent(searchParamsResolved.name)
          : "Untitled Plan"
        : plan.planName

    // Replace with real auth in production
    const user = {
      name: "Demo User",
      email: "user@example.com",
    }

    return (
      <PlanRoom roomId={`plan-${planId}`} userName={user.name} userEmail={user.email}>
        <BusinessPlanEditor planId={planId} planName={derivedName} userEmail={user.email} />
      </PlanRoom>
    )
  } catch (error) {
    console.error("Error loading plan:", error)
    notFound()
  }
}

// Add metadata for better SEO
export async function generateMetadata({ params }: { params: { planId: string } }) {
  const { planId } = params

  try {
    const plan = await getBusinessPlan(planId)
    return {
      title: plan?.planName ? `${plan.planName} - Business Plan Builder` : "Business Plan Builder",
      description: "Collaborative business plan editor with real-time editing",
    }
  } catch {
    return {
      title: "Business Plan Builder",
      description: "Collaborative business plan editor with real-time editing",
    }
  }
}
