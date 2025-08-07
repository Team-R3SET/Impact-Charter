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
  console.log(`[getPlanWithRetry] Attempting to fetch plan: ${planId}`)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiUrl = `${baseUrl}/api/business-plans/${planId}`
  console.log(`[getPlanWithRetry] API URL: ${apiUrl}`)
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[getPlanWithRetry] Attempt ${attempt}/${maxRetries}`)
      
      const response = await fetch(apiUrl, {
        cache: 'no-store', // Ensure we get fresh data
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      console.log(`[getPlanWithRetry] Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[getPlanWithRetry] Plan found:`, data.plan)
        return data.plan
      }

      if (response.status === 404) {
        console.log(`[getPlanWithRetry] Plan not found (404)`)
        return null // Plan not found
      }

      const errorText = await response.text()
      console.error(`[getPlanWithRetry] Error response: ${errorText}`)

      if (attempt < maxRetries) {
        console.log(`[getPlanWithRetry] Waiting ${delay}ms before retry`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      if (planId.startsWith('local-')) {
        console.log(`[getPlanWithRetry] Creating fallback plan for local ID: ${planId}`)
        return {
          id: planId,
          planName: "Local Business Plan",
          ownerEmail: "user@example.com",
          status: "Draft",
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          description: "This is a locally created business plan"
        }
      }
      
      return null
    } catch (error) {
      console.warn(`[getPlanWithRetry] Attempt ${attempt} failed:`, error)
      
      if (attempt === maxRetries && planId.startsWith('local-')) {
        console.log(`[getPlanWithRetry] Creating fallback plan for local ID after all retries failed: ${planId}`)
        return {
          id: planId,
          planName: "Local Business Plan",
          ownerEmail: "user@example.com",
          status: "Draft",
          createdDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          description: "This is a locally created business plan"
        }
      }
      
      if (attempt === maxRetries) {
        console.error(`[getPlanWithRetry] All ${maxRetries} attempts to fetch plan failed`)
        return null
      }
      
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

    const user = {
      name: "Demo User",
      email: "user@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
    }

    const isCollabMode = searchParamsResolved.collab === "true"

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

    return <BusinessPlanEditor planId={planId} planName={derivedName} userEmail={user.email} showHeader={true} />
  } catch (error) {
    console.error("Error loading plan:", error)
    notFound()
  }
}

export async function generateMetadata({ params }: { params: { planId: string } }) {
  const { planId } = params

  try {
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
