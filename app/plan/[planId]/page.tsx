import { getBusinessPlan } from "@/lib/airtable"
import { BusinessPlanEditor } from "@/components/business-plan-editor"
import { PlanRoom } from "@/components/plan-room"
import { AppHeader } from "@/components/app-header"
import { notFound } from "next/navigation"
import { userSettingsStore } from "@/lib/shared-store"

interface PlanPageProps {
  params: { planId: string }
  searchParams: Record<string, string | string[]>
}

async function getPlanWithRetry(planId: string, maxRetries = 3, delay = 300): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business-plans/${planId}`, {
        cache: 'no-store' // Ensure we get fresh data
      })

      if (response.ok) {
        const data = await response.json()
        return data.plan
      }

      if (response.status === 404) {
        return null // Plan not found
      }

      // If we get other errors and have retries left, wait and try again
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return null
    } catch (error) {
      console.warn(`Plan fetch attempt ${attempt} failed:`, error)
      
      // Don't throw on last attempt, just return null
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts to fetch plan failed`)
        return null
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  return null
}

export default async function PlanPage({ params, searchParams }: PlanPageProps) {
  const { planId } = params
  const searchParamsResolved = searchParams

  if (!planId || typeof planId !== "string") {
    notFound()
  }

  try {
    const plan = await getPlanWithRetry(planId)

    if (!plan) {
      console.log(`[PlanPage] Plan not found: ${planId}, redirecting to 404`)
      notFound()
    }

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
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    }

    // Check if collaboration is requested
    const isCollabMode = searchParamsResolved.collab === "true"

    // If collaboration is requested, wrap with PlanRoom
    if (isCollabMode) {
      return (
        <>
          <AppHeader currentUser={user} currentPlanId={planId} />
          <PlanRoom roomId={`plan-${planId}`} userName={user.name} userEmail={user.email}>
            <BusinessPlanEditor planId={planId} planName={derivedName} userEmail={user.email} showHeader={false} />
          </PlanRoom>
        </>
      )
    }

    // Default mode without collaboration
    return <BusinessPlanEditor planId={planId} planName={derivedName} userEmail={user.email} showHeader={true} />
  } catch (error) {
    console.error("Error loading plan:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: { params: { planId: string } }) {
  const { planId } = params

  try {
    // Added safe error handling for metadata generation
    const plan = await getPlanWithRetry(planId).catch(() => null)
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
