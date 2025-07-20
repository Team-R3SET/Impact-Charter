import { BusinessPlanEditor } from "@/components/business-plan-editor"
import { RoomProvider } from "@/lib/liveblocks"
import { getBusinessPlan } from "@/lib/airtable"
import { notFound } from "next/navigation"

interface PlanPageProps {
  params: {
    planId: string
  }
}

export default async function PlanPage({ params }: PlanPageProps) {
  const plan = await getBusinessPlan(params.planId)

  if (!plan) {
    notFound()
  }

  // In a real app, you'd get this from authentication
  const userEmail = "user@example.com"
  const userName = "Demo User"

  return (
    <RoomProvider
      id={`plan-${params.planId}`}
      initialPresence={{
        cursor: null,
        selectedSection: null,
        user: {
          name: userName,
          email: userEmail,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
        },
      }}
      initialStorage={{
        sections: {},
      }}
    >
      <BusinessPlanEditor planId={params.planId} planName={plan.planName} userEmail={userEmail} />
    </RoomProvider>
  )
}
