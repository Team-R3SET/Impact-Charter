import { getBusinessPlans } from "@/lib/airtable"
import { BusinessPlansGrid } from "@/components/business-plans-grid"

export default async function PlansPage() {
  // TODO: Replace with real auth
  const userEmail = "user@example.com"

  const plans = await getBusinessPlans(userEmail)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Business Plans</h1>
        <p className="text-muted-foreground">Manage and organize all your business plans in one place.</p>
      </div>

      <BusinessPlansGrid plans={plans} />
    </div>
  )
}

export const metadata = {
  title: "My Business Plans - Business Plan Builder",
  description: "View and manage all your business plans",
}
