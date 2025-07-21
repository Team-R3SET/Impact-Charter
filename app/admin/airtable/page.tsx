import { AdminLayout } from "@/components/admin-layout"
import { AirtableAdmin } from "@/components/airtable-admin"

export default function AirtableAdminPage() {
  return (
    <AdminLayout
      title="Airtable Debug Console"
      description="Debug and monitor Airtable connections, test API calls, and view table structures"
    >
      <AirtableAdmin />
    </AdminLayout>
  )
}
