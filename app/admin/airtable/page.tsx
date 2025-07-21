"use client"

import { AdminLayout } from "@/components/admin-layout"
import { AirtableAdmin } from "@/components/airtable-admin"

export default function AdminAirtablePage() {
  return (
    <AdminLayout
      title="Airtable Administration"
      description="Debug Airtable connections, browse tables, and test API calls"
    >
      <AirtableAdmin />
    </AdminLayout>
  )
}
