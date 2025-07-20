import { AdminDashboard } from "@/components/admin-dashboard"
import { getCurrentUser, canAccessAdminFeatures } from "@/lib/user-management"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  // Mock current user - in a real app, get this from your auth system
  const currentUser = await getCurrentUser("admin@example.com")

  if (!currentUser || !canAccessAdminFeatures(currentUser)) {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-8">
      <AdminDashboard currentUser={currentUser} />
    </div>
  )
}
