"use client"

import { AdminLayout } from "@/components/admin-layout"
import { SystemLogsPage } from "@/components/system-logs-page"

export default function AdminLogsPage() {
  return (
    <AdminLayout title="System Logs" description="View and analyze system events, errors, and operational data">
      <SystemLogsPage />
    </AdminLayout>
  )
}
