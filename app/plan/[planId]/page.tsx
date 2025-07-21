import { createClient } from "@/lib/supabase/server"
import { getBusinessPlan, getPlanSections } from "@/lib/supabase/queries"
import { notFound, redirect } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { PlanRoom } from "@/components/plan-room"

export default async function PlanPage({ params }: { params: { planId: string } }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const plan = await getBusinessPlan(params.planId)
  if (!plan) {
    notFound()
  }

  const sections = await getPlanSections(params.planId)

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <PlanRoom plan={plan} initialSections={sections} />
      </main>
    </div>
  )
}
