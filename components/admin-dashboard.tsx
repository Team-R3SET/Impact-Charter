"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  Shield,
  AlertCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User, AccessLog, ErrorLog } from "@/lib/user-types"
import { getErrorExplanation } from "@/lib/logging"

interface AdminDashboardProps {
  currentUser: User
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
  const [errorStats, setErrorStats] = useState({
    total: 0,
    unresolved: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchAccessLogs = async () => {
    try {
      const response = await fetch(`/api/admin/logs/access?userEmail=${encodeURIComponent(currentUser.email)}`)
      if (response.ok) {
        const data = await response.json()
        setAccessLogs(data.logs)
      }
    } catch (error) {
      console.error("Failed to fetch access logs:", error)
    }
  }

  const fetchErrorLogs = async () => {
    try {
      const response = await fetch(`/api/admin/logs/errors?userEmail=${encodeURIComponent(currentUser.email)}`)
      if (response.ok) {
        const data = await response.json()
        setErrorLogs(data.logs)
        setErrorStats(data.stats)
      }
    } catch (error) {
      console.error("Failed to fetch error logs:", error)
    }
  }

  const resolveError = async (errorId: string) => {
    try {
      const response = await fetch(`/api/admin/logs/errors/${errorId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentUser.email }),
      })

      if (response.ok) {
        toast({
          title: "Error Resolved",
          description: "The error has been marked as resolved.",
        })
        fetchErrorLogs() // Refresh the logs
      } else {
        throw new Error("Failed to resolve error")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve the error. Please try again.",
        variant: "destructive",
      })
    }
  }

  const refreshLogs = async () => {
    setIsLoading(true)
    await Promise.all([fetchAccessLogs(), fetchErrorLogs()])
    setIsLoading(false)
  }

  useEffect(() => {
    refreshLogs()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "destructive"
      case "HIGH":
        return "destructive"
      case "MEDIUM":
        return "default"
      case "LOW":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <XCircle className="w-4 h-4" />
      case "HIGH":
        return <AlertTriangle className="w-4 h-4" />
      case "MEDIUM":
        return <AlertCircle className="w-4 h-4" />
      case "LOW":
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  if (currentUser.role !== "administrator") {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>You don't have permission to access the admin dashboard.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor system activity and manage errors</p>
        </div>
        <Button onClick={refreshLogs} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{errorStats.unresolved}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{errorStats.critical}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessLogs.length}</div>
            <p className="text-xs text-muted-foreground">Access logs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>System errors and their details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {errorLogs.map((error) => (
                    <Card key={error.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0">{getSeverityIcon(error.severity)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getSeverityColor(error.severity) as any}>{error.severity}</Badge>
                              <Badge variant="outline">{error.errorType}</Badge>
                              {error.resolved && (
                                <Badge variant="secondary">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm mb-1">{error.error}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{getErrorExplanation(error)}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(error.timestamp).toLocaleString()}</span>
                              {error.userName && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {error.userName}
                                </span>
                              )}
                              <span>{error.url}</span>
                            </div>
                            {error.context && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>Context:</strong> {JSON.stringify(error.context, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                        {!error.resolved && (
                          <Button size="sm" variant="outline" onClick={() => resolveError(error.id)}>
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                  {errorLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No error logs found</div>
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
              <CardDescription>User activity and system access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{log.userName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{log.userName}</div>
                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "secondary" : "destructive"}>
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{log.ipAddress || "Unknown"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {accessLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No access logs found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
