"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/hooks/use-toast"
import {
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Zap,
  Calendar,
  User,
  Globe,
  Clock,
  Filter,
  FileText,
  Database,
  Shield,
  Activity,
  Users,
  Server,
  Briefcase,
} from "lucide-react"
import type { SystemLog, LogStats } from "@/lib/system-logs"

const LOG_LEVEL_COLORS = {
  DEBUG: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  INFO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  WARN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CRITICAL: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
}

const LOG_LEVEL_ICONS = {
  DEBUG: Info,
  INFO: Info,
  WARN: AlertTriangle,
  ERROR: AlertCircle,
  CRITICAL: XCircle,
}

const CATEGORY_ICONS = {
  USER: Users,
  SYSTEM: Server,
  API: Globe,
  DATABASE: Database,
  SECURITY: Shield,
  PERFORMANCE: Activity,
  BUSINESS: Briefcase,
}

export function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  // Fetch logs with filters
  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })

      if (searchQuery) params.append("search", searchQuery)
      if (selectedLevels.length > 0) params.append("levels", selectedLevels.join(","))
      if (selectedCategories.length > 0) params.append("categories", selectedCategories.join(","))
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const [logsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/logs?${params}`),
        fetch("/api/admin/logs/stats"),
      ])

      if (logsResponse.ok && statsResponse.ok) {
        const logsData = await logsResponse.json()
        const statsData = await statsResponse.json()

        setLogs(
          logsData.logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })),
        )
        setTotalPages(logsData.pagination.totalPages)
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    fetchLogs()
  }, [currentPage, pageSize, searchQuery, selectedLevels, selectedCategories, startDate, endDate])

  // Handle level filter toggle
  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
    setCurrentPage(1)
  }

  // Handle category filter toggle
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
    setCurrentPage(1)
  }

  // Toggle log expansion
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  // Export logs
  const handleExport = async (format: "csv" | "json" | "txt") => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedLevels.length > 0) params.append("levels", selectedLevels.join(","))
      if (selectedCategories.length > 0) params.append("categories", selectedCategories.join(","))
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      params.append("format", format)

      const response = await fetch(`/api/admin/logs/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `system-logs-${new Date().toISOString().split("T")[0]}.${format}`
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: "Success",
          description: `Logs exported as ${format.toUpperCase()}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      })
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedLevels([])
    setSelectedCategories([])
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.error + stats.critical}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.warn}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
              <Info className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.info}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Debug</CardTitle>
              <Zap className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.debug}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24Hours}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Monitor and analyze system activity and events</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleExport("csv")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => handleExport("json")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button onClick={() => handleExport("txt")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                TXT
              </Button>
              <Button onClick={fetchLogs} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Log Levels */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Log Levels</Label>
                <div className="space-y-2">
                  {["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={selectedLevels.includes(level)}
                        onCheckedChange={() => toggleLevel(level)}
                      />
                      <Label htmlFor={`level-${level}`} className="text-sm">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Categories</Label>
                <div className="space-y-2">
                  {["USER", "SYSTEM", "API", "DATABASE", "SECURITY", "PERFORMANCE", "BUSINESS"].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Date Range</Label>
                <div className="space-y-2">
                  <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Start date"
                  />
                  <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="End date"
                  />
                </div>
              </div>

              {/* Page Size */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Page Size</Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number.parseInt(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 logs</SelectItem>
                    <SelectItem value="50">50 logs</SelectItem>
                    <SelectItem value="100">100 logs</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={clearFilters} variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedLevels.length > 0 || selectedCategories.length > 0 || searchQuery || startDate || endDate) && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <span className="text-sm font-medium">Active filters:</span>
              {selectedLevels.map((level) => (
                <Badge key={level} variant="secondary" className="cursor-pointer" onClick={() => toggleLevel(level)}>
                  {level} ×
                </Badge>
              ))}
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  {category} ×
                </Badge>
              ))}
              {searchQuery && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                  Search: {searchQuery} ×
                </Badge>
              )}
              {(startDate || endDate) && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setStartDate("")
                    setEndDate("")
                  }}
                >
                  Date Range ×
                </Badge>
              )}
            </div>
          )}

          {/* Logs List */}
          <div className="border rounded-lg">
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {logs.map((log) => {
                  const LevelIcon = LOG_LEVEL_ICONS[log.level]
                  const CategoryIcon = CATEGORY_ICONS[log.category]
                  const isExpanded = expandedLogs.has(log.id)

                  return (
                    <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleLogExpansion(log.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <LevelIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={LOG_LEVEL_COLORS[log.level]}>{log.level}</Badge>
                                <Badge variant="outline">
                                  <CategoryIcon className="h-3 w-3 mr-1" />
                                  {log.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{log.timestamp.toLocaleString()}</span>
                              </div>
                              <p className="text-sm font-medium truncate">{log.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                {log.userEmail && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {log.userEmail}
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <div className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {log.ipAddress}
                                  </div>
                                )}
                                {log.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {log.duration}ms
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 ml-9">
                          <Separator className="mb-4" />
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="context">Context</TabsTrigger>
                              <TabsTrigger value="metadata">Metadata</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Message</Label>
                                <p className="text-sm mt-1">{log.message}</p>
                              </div>
                              {log.details && (
                                <div>
                                  <Label className="text-sm font-medium">Details</Label>
                                  <p className="text-sm mt-1">{log.details}</p>
                                </div>
                              )}
                              {log.stackTrace && (
                                <div>
                                  <Label className="text-sm font-medium">Stack Trace</Label>
                                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                                    {log.stackTrace}
                                  </pre>
                                </div>
                              )}
                            </TabsContent>
                            <TabsContent value="context" className="space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Timestamp</Label>
                                  <p className="text-sm mt-1">{log.timestamp.toISOString()}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Level</Label>
                                  <p className="text-sm mt-1">{log.level}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Category</Label>
                                  <p className="text-sm mt-1">{log.category}</p>
                                </div>
                                {log.userId && (
                                  <div>
                                    <Label className="text-sm font-medium">User ID</Label>
                                    <p className="text-sm mt-1">{log.userId}</p>
                                  </div>
                                )}
                                {log.userEmail && (
                                  <div>
                                    <Label className="text-sm font-medium">User Email</Label>
                                    <p className="text-sm mt-1">{log.userEmail}</p>
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <div>
                                    <Label className="text-sm font-medium">IP Address</Label>
                                    <p className="text-sm mt-1">{log.ipAddress}</p>
                                  </div>
                                )}
                                {log.requestId && (
                                  <div>
                                    <Label className="text-sm font-medium">Request ID</Label>
                                    <p className="text-sm mt-1">{log.requestId}</p>
                                  </div>
                                )}
                                {log.duration && (
                                  <div>
                                    <Label className="text-sm font-medium">Duration</Label>
                                    <p className="text-sm mt-1">{log.duration}ms</p>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                            <TabsContent value="metadata" className="space-y-3">
                              {log.userAgent && (
                                <div>
                                  <Label className="text-sm font-medium">User Agent</Label>
                                  <p className="text-sm mt-1 break-all">{log.userAgent}</p>
                                </div>
                              )}
                              {log.metadata && (
                                <div>
                                  <Label className="text-sm font-medium">Additional Metadata</Label>
                                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto">
                                    {JSON.stringify(log.metadata, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {logs.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs found matching your criteria</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
