"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { AdminDashboard } from "@/components/admin-dashboard"
import { useUser } from "@/contexts/user-context"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { currentUser, isAdmin, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    // If loading is finished and the user is not an admin, redirect to login.
    if (!isLoading && !isAdmin) {
      router.push("/login")
    }
  }, [isAdmin, isLoading, router])

  // Show a loading state while checking auth or if user is not an admin yet.
  if (isLoading || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Render the dashboard only if the user is an admin.
  return (
    <AdminLayout>
      <AdminDashboard currentUser={currentUser} />
    </AdminLayout>
  )
}
