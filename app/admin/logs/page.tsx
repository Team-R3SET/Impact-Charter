import { AdminLayout } from "@/components/admin-layout"
import { SystemLogsPage } from "@/components/system-logs-page"

export default function AdminLogsPage() {
  return (
    <AdminLayout title="System Logs" description="Monitor and analyze system activity, errors, and performance metrics">
      <SystemLogsPage />
    </AdminLayout>
  )
}
