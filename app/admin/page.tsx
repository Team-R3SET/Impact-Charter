"use client"

import { AdminLayout } from "@/components/admin-layout"
import { AdminDashboard } from "@/components/admin-dashboard"
import { useUser } from "@/contexts/user-context"

export default function AdminPage() {
  const { user } = useUser()

  if (!user) {
    return null
  }

  return (
    <AdminLayout>
      <AdminDashboard currentUser={user} />
    </AdminLayout>
  )
}
