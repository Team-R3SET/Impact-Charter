import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserStats } from "@/lib/user-management"
import type { User } from "@/lib/user-types"
import { Users, BarChart, AlertCircle, Database, ArrowRight } from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  currentUser: User
}

export async function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const stats = await getUserStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {currentUser.name}. Here's an overview of the application.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{stats.active} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.administrators}</div>
            <p className="text-xs text-muted-foreground">out of {stats.total} users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.recentLogins}</div>
            <p className="text-xs text-muted-foreground">in the last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Logs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 unresolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Tools</h2>
        <p className="text-muted-foreground">Access specialized tools for debugging and managing the application.</p>
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Airtable Debugging
              </CardTitle>
              <CardDescription>
                View Airtable connection status, browse tables, and test API calls directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/airtable">
                <Button className="w-full">
                  Open Airtable Admin <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>View, edit, and manage user accounts and roles. (Coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Manage Users <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
