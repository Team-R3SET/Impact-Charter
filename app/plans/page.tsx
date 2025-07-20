import { getBusinessPlans } from "@/lib/airtable"
import { BusinessPlansGrid } from "@/components/business-plans-grid"
import { AppHeader } from "@/components/app-header"

export default async function PlansPage() {
  // TODO: Replace with real auth
  const userEmail = "user@example.com"
  const currentUser = {
    name: "Demo User",
    email: userEmail,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  const plans = await getBusinessPlans(userEmail)

  return (
    <>
      <AppHeader currentUser={currentUser} />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Business Plans</h1>
          <p className="text-muted-foreground">Manage and organize all your business plans in one place.</p>
        </div>

        <BusinessPlansGrid plans={plans} />
      </div>
    </>
  )
}

export const metadata = {
  title: "My Business Plans - Business Plan Builder",
  description: "View and manage all your business plans",
}
