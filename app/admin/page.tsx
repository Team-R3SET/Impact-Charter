import { AdminLayout } from "@/components/admin-layout"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminPage() {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Monitor system health, user activity, and manage administrative tasks"
    >
      <AdminDashboard />
    </AdminLayout>
  )
}
