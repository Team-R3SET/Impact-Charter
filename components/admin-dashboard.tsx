"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, FileText, Activity, AlertTriangle, CheckCircle, Clock, Shield, RefreshCw } from "lucide-react"
import { useUser } from "@/contexts/user-context"

interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalPlans: number
  activePlans: number
  systemHealth: "healthy" | "warning" | "error"
  lastUpdated: string
}

interface RecentActivity {
  id: string
  type: "user_login" | "plan_created" | "plan_updated" | "error"
  user: string
  description: string
  timestamp: string
}

interface SystemAlert {
  id: string
  type: "info" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  resolved: boolean
}

export function AdminDashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPlans: 0,
    activePlans: 0,
    systemHealth: "healthy",
    lastUpdated: new Date().toISOString(),
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls - replace with actual endpoints
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data - replace with actual API calls
      setStats({
        totalUsers: 156,
        activeUsers: 23,
        totalPlans: 89,
        activePlans: 34,
        systemHealth: "healthy",
        lastUpdated: new Date().toISOString(),
      })

      setRecentActivity([
        {
          id: "1",
          type: "user_login",
          user: "john.doe@example.com",
          description: "User logged in",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "plan_created",
          user: "jane.smith@example.com",
          description: "Created new business plan: 'Tech Startup 2024'",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "plan_updated",
          user: "mike.wilson@example.com",
          description: "Updated business plan: 'Restaurant Chain'",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
      ])

      setSystemAlerts([
        {
          id: "1",
          type: "info",
          title: "System Maintenance",
          message: "Scheduled maintenance window: Sunday 2:00 AM - 4:00 AM EST",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
        {
          id: "2",
          type: "warning",
          title: "High API Usage",
          message: "Airtable API usage is at 85% of monthly limit",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: false,
        },
      ])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
  }

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "user_login":
        return <Users className="w-4 h-4 text-blue-500" />
      case "plan_created":
        return <FileText className="w-4 h-4 text-green-500" />
      case "plan_updated":
        return <Activity className="w-4 h-4 text-orange-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getAlertIcon = (type: SystemAlert["type"]) => {
    switch (type) {
      case "info":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} active today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">{stats.activePlans} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={stats.systemHealth === "healthy" ? "default" : "destructive"}>{stats.systemHealth}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTimeAgo(stats.lastUpdated)}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs p-0 h-auto"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user actions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.user}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important system notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <Alert key={alert.id}>
                    {getAlertIcon(alert.type)}
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{formatTimeAgo(alert.timestamp)}</p>
                        </div>
                        {!alert.resolved && (
                          <Button variant="outline" size="sm">
                            Resolve
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">User Management Coming Soon</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Advanced user management features will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
