"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  Info,
  AlertCircle,
  Zap,
  Database,
  Shield,
  Activity,
  FileText,
  Settings,
  BarChart3,
} from "lucide-react"
import type { SystemLog, LogLevel, LogCategory, LogFilter } from "@/lib/system-logs"

interface LogsResponse {
  logs: SystemLog[]
  total: number
  pages: number
}

interface LogStats {
  total: number
  byLevel: Record<LogLevel, number>
  byCategory: Record<LogCategory, number>
  last24Hours: number
}

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  INFO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  WARN: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CRITICAL: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
}

const LOG_LEVEL_ICONS: Record<LogLevel, React.ComponentType<{ className?: string }>> = {
  DEBUG: Settings,
  INFO: Info,
  WARN: AlertTriangle,
  ERROR: AlertCircle,
  CRITICAL: Zap,
}

const LOG_CATEGORY_ICONS: Record<LogCategory, React.ComponentType<{ className?: string }>> = {
  USER: User,
  SYSTEM: Settings,
  API: Activity,
  DATABASE: Database,
  SECURITY: Shield,
  PERFORMANCE: BarChart3,
  BUSINESS: FileText,
}

export function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  // Filters
  const [filters, setFilters] = useState<LogFilter>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([])
  const [selectedCategories, setSelectedCategories] = useState<LogCategory[]>([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [pageSize, setPageSize] = useState(50)

  const fetchLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(page === 1)
        setRefreshing(page !== 1)

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        })

        if (selectedLevels.length > 0) {
          params.append("level", selectedLevels.join(","))
        }

        if (selectedCategories.length > 0) {
          params.append("category", selectedCategories.join(","))
        }

        if (searchTerm) {
          params.append("search", searchTerm)
        }

        if (dateFrom) {
          params.append("dateFrom", dateFrom)
        }

        if (dateTo) {
          params.append("dateTo", dateTo)
        }

        const response = await fetch(`/api/admin/logs?${params}`)
        if (!response.ok) throw new Error("Failed to fetch logs")

        const data: LogsResponse = await response.json()
        setLogs(data.logs)
        setTotalPages(data.pages)
        setTotalLogs(data.total)
        setCurrentPage(page)
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [selectedLevels, selectedCategories, searchTerm, dateFrom, dateTo, pageSize],
  )

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/logs/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [])

  useEffect(() => {
    fetchLogs(1)
    fetchStats()
  }, [fetchLogs, fetchStats])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLogs(1)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedLevels([])
    setSelectedCategories([])
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
    setTimeout(() => fetchLogs(1), 0)
  }

  const handleExport = async (format: "csv" | "json" | "txt") => {
    try {
      setExporting(true)

      const exportFilters: LogFilter = {}
      if (selectedLevels.length > 0) exportFilters.level = selectedLevels
      if (selectedCategories.length > 0) exportFilters.category = selectedCategories
      if (searchTerm) exportFilters.search = searchTerm
      if (dateFrom) exportFilters.dateFrom = dateFrom
      if (dateTo) exportFilters.dateTo = dateTo

      const response = await fetch("/api/admin/logs/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          filters: exportFilters,
          limit: 1000,
        }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setExporting(false)
    }
  }

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedLogs(newExpanded)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return ""
    if (duration < 1000) return `${duration}ms`
    return `${(duration / 1000).toFixed(2)}s`
  }

  const getLevelIcon = (level: LogLevel) => {
    const Icon = LOG_LEVEL_ICONS[level]
    return <Icon className="w-4 h-4" />
  }

  const getCategoryIcon = (category: LogCategory) => {
    const Icon = LOG_CATEGORY_ICONS[category]
    return <Icon className="w-4 h-4" />
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.last24Hours} in last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(stats.byLevel.ERROR + stats.byLevel.CRITICAL).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.byLevel.ERROR} errors, {stats.byLevel.CRITICAL} critical
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.byLevel.WARN.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info & Debug</CardTitle>
              <Info className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.byLevel.INFO + stats.byLevel.DEBUG).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Normal operations</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
          <CardDescription>Filter and search through system logs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>

          {/* Date Range */}
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">From Date</label>
              <Input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">To Date</label>
              <Input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Level and Category Filters */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Log Levels</label>
              <div className="space-y-2">
                {(["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"] as LogLevel[]).map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLevels([...selectedLevels, level])
                        } else {
                          setSelectedLevels(selectedLevels.filter((l) => l !== level))
                        }
                      }}
                    />
                    <label htmlFor={`level-${level}`} className="flex items-center gap-2 text-sm">
                      {getLevelIcon(level)}
                      <Badge className={LOG_LEVEL_COLORS[level]}>{level}</Badge>
                      {stats && <span className="text-muted-foreground">({stats.byLevel[level]})</span>}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Categories</label>
              <div className="space-y-2">
                {(["USER", "SYSTEM", "API", "DATABASE", "SECURITY", "PERFORMANCE", "BUSINESS"] as LogCategory[]).map(
                  (category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category])
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== category))
                          }
                        }}
                      />
                      <label htmlFor={`category-${category}`} className="flex items-center gap-2 text-sm">
                        {getCategoryIcon(category)}
                        <Badge variant="outline">{category}</Badge>
                        {stats && <span className="text-muted-foreground">({stats.byCategory[category]})</span>}
                      </label>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchLogs(currentPage)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport("txt")} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            TXT
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                Showing {logs.length} of {totalLogs.toLocaleString()} logs
              </CardDescription>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLogs(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No logs found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {logs.map((log) => {
                  const isExpanded = expandedLogs.has(log.id)

                  return (
                    <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleLogExpansion(log.id)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              {getLevelIcon(log.level)}
                              <Badge className={LOG_LEVEL_COLORS[log.level]}>{log.level}</Badge>
                            </div>

                            <div className="flex items-center gap-2">
                              {getCategoryIcon(log.category)}
                              <Badge variant="outline">{log.category}</Badge>
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{log.message}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>{formatTimestamp(log.timestamp)}</span>
                                {log.userName && <span>by {log.userName}</span>}
                                {log.duration && <span>{formatDuration(log.duration)}</span>}
                                {log.statusCode && (
                                  <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"}>
                                    {log.statusCode}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="ml-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-2">
                          <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="details">Details</TabsTrigger>
                              <TabsTrigger value="context">Context</TabsTrigger>
                              <TabsTrigger value="metadata">Metadata</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="space-y-3">
                              <div className="grid gap-2 text-sm">
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="font-medium">ID:</span>
                                  <span className="col-span-2 font-mono text-xs">{log.id}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="font-medium">Timestamp:</span>
                                  <span className="col-span-2">{formatTimestamp(log.timestamp)}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <span className="font-medium">Message:</span>
                                  <span className="col-span-2">{log.message}</span>
                                </div>
                                {log.details && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Details:</span>
                                    <span className="col-span-2">{log.details}</span>
                                  </div>
                                )}
                                {log.error && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Error:</span>
                                    <span className="col-span-2 text-red-600 dark:text-red-400">{log.error}</span>
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="context" className="space-y-3">
                              <div className="grid gap-2 text-sm">
                                {log.userName && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">User:</span>
                                    <span className="col-span-2">
                                      {log.userName} ({log.userEmail})
                                    </span>
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">IP Address:</span>
                                    <span className="col-span-2 font-mono">{log.ipAddress}</span>
                                  </div>
                                )}
                                {log.resource && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Resource:</span>
                                    <span className="col-span-2 font-mono">{log.resource}</span>
                                  </div>
                                )}
                                {log.action && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Action:</span>
                                    <span className="col-span-2">{log.action}</span>
                                  </div>
                                )}
                                {log.userAgent && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">User Agent:</span>
                                    <span className="col-span-2 text-xs font-mono break-all">{log.userAgent}</span>
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            <TabsContent value="metadata" className="space-y-3">
                              <div className="grid gap-2 text-sm">
                                {log.duration && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Duration:</span>
                                    <span className="col-span-2">{formatDuration(log.duration)}</span>
                                  </div>
                                )}
                                {log.statusCode && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Status Code:</span>
                                    <span className="col-span-2">
                                      <Badge variant={log.statusCode >= 400 ? "destructive" : "secondary"}>
                                        {log.statusCode}
                                      </Badge>
                                    </span>
                                  </div>
                                )}
                                {log.metadata && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Metadata:</span>
                                    <pre className="col-span-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                                      {JSON.stringify(log.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.stack && (
                                  <div className="grid grid-cols-3 gap-2">
                                    <span className="font-medium">Stack Trace:</span>
                                    <pre className="col-span-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto whitespace-pre-wrap">
                                      {log.stack}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
