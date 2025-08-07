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
      // Try to get user credentials for better Airtable access
      // For now, we'll use a demo email since we don't have user context in server components
      const demoEmail = "user@example.com"
      const userSettings = userSettingsStore.get(demoEmail)
      let credentials: { baseId: string; token: string } | undefined

      if (userSettings?.airtablePersonalAccessToken && userSettings?.airtableBaseId) {
        credentials = {
          baseId: userSettings.airtableBaseId,
          token: userSettings.airtablePersonalAccessToken
        }
      }

      // Added check for localStorage availability in server component
      if (typeof window === 'undefined') {
        console.log(`[getPlanWithRetry] Running on server, localStorage not available. Attempt ${attempt}`)
        // Wait before retrying on server
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        return null
      }

      const plan = await getBusinessPlan(planId, credentials)
      if (plan) {
        return plan
      }
      
      // If no plan found and we have retries left, wait and try again
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
