import { Suspense } from "react"
import { getBusinessPlans } from "@/lib/airtable"
import { BusinessPlansGrid } from "@/components/business-plans-grid"
import { AppHeader } from "@/components/app-header"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

async function PlansContent() {
  // TODO: Replace with real auth
  const userEmail = "user@example.com"
  const plans = await getBusinessPlans(userEmail)

  return <BusinessPlansGrid plans={plans} />
}

export default function PlansPage() {
  const currentUser = {
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  return (
    <>
      <AppHeader currentUser={currentUser} />
      <div className="container mx-auto py-6 px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Business Plans</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <Suspense fallback={<BusinessPlansGrid plans={[]} isLoading={true} />}>
          <PlansContent />
        </Suspense>
      </div>
    </>
  )
}

export const metadata = {
  title: "My Business Plans - Business Plan Builder",
  description: "View and manage all your business plans with advanced filtering and organization tools",
}
