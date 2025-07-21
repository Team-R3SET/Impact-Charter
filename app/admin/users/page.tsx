import { AdminLayout } from "@/components/admin-layout"
import { UserManagementPage } from "@/components/user-management-page"

export default function AdminUsersPage() {
  return (
    <AdminLayout title="User Management" description="Manage user accounts, roles, and permissions across the system">
      <UserManagementPage />
    </AdminLayout>
  )
}
