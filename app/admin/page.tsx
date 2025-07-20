import { AdminDashboard } from "@/components/admin-dashboard"
import { getCurrentUser } from "@/lib/user-management"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  // In a real app, you'd get this from authentication
  const currentUser = await getCurrentUser("admin@example.com")

  if (!currentUser || currentUser.role !== "administrator") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-6">
      <AdminDashboard currentUser={currentUser} />
    </div>
  )
}
