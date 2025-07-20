"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, CheckCircle, Clock, Users, Activity, Shield } from "lucide-react"
import type { AccessLog, ErrorLog } from "@/lib/user-types"

interface AdminDashboardProps {
  currentUser: {
    id: string
    name: string
    email: string
    role: "administrator" | "regular"
  }
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalErrors: 0,
    unresolvedErrors: 0,
    recentActivity: 0,
  })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      const [accessResponse, errorResponse] = await Promise.all([
        fetch("/api/admin/logs/access"),
        fetch("/api/admin/logs/errors"),
      ])

      if (accessResponse.ok) {
        const accessData = await accessResponse.json()
        setAccessLogs(accessData.logs || [])
      }

      if (errorResponse.ok) {
        const errorData = await errorResponse.json()
        setErrorLogs(errorData.logs || [])
      }

      // Calculate stats
      const totalErrors = errorLogs.length
      const unresolvedErrors = errorLogs.filter((log) => !log.resolved).length
      const recentActivity = accessLogs.filter(
        (log) => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
      ).length

      setStats({
        totalUsers: 3, // Mock data
        activeUsers: 3,
        totalErrors,
        unresolvedErrors,
        recentActivity,
      })
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const resolveError = async (errorId: string) => {
    try {
      const response = await fetch(`/api/admin/logs/errors/${errorId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolvedBy: currentUser.name }),
      })

      if (response.ok) {
        setErrorLogs((prev) =>
          prev.map((log) =>
            log.id === errorId
              ? { ...log, resolved: true, resolvedBy: currentUser.name, resolvedDate: new Date().toISOString() }
              : log,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to resolve error:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive"
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "secondary"
      case "LOW":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors}</div>
            <p className="text-xs text-muted-foreground">{stats.unresolvedErrors} unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Tabs */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>System errors with detailed explanations and resolution tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {errorLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No errors logged</p>
                  ) : (
                    errorLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(log.severity)}>{log.severity}</Badge>
                            <Badge variant="outline">{log.errorType}</Badge>
                            {log.resolved && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium">{log.error}</p>
                          {log.userEmail && (
                            <p className="text-sm text-muted-foreground">
                              User: {log.userName} ({log.userEmail})
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">URL: {log.url}</p>
                        </div>

                        {log.stack && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Stack trace</summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">{log.stack}</pre>
                          </details>
                        )}

                        {log.resolved ? (
                          <div className="text-sm text-green-600">
                            Resolved by {log.resolvedBy} on {new Date(log.resolvedDate!).toLocaleString()}
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => resolveError(log.id)} className="mt-2">
                            Mark as Resolved
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>User activity and system access tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {accessLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No access logs</p>
                  ) : (
                    accessLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={log.success ? "default" : "destructive"}>
                              {log.success ? "SUCCESS" : "FAILED"}
                            </Badge>
                            <span className="font-medium">{log.action}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.userName} ({log.userEmail}) - {log.resource}
                          </div>
                          {log.details && <div className="text-xs text-muted-foreground mt-1">{log.details}</div>}
                        </div>
                        <div className="text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
