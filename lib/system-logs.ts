export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"
export type LogCategory = "USER" | "SYSTEM" | "API" | "DATABASE" | "SECURITY" | "PERFORMANCE" | "BUSINESS"

export interface SystemLog {
  id: string
  timestamp: string
  level: LogLevel
  category: LogCategory
  message: string
  details?: string
  userId?: string
  userEmail?: string
  userName?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  duration?: number
  statusCode?: number
  error?: string
  stack?: string
  metadata?: Record<string, any>
}

export interface LogFilter {
  level?: LogLevel[]
  category?: LogCategory[]
  userId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface LogExportOptions {
  format: "csv" | "json" | "txt"
  filters?: LogFilter
  limit?: number
}

// Mock data generator for demonstration
const generateMockLogs = (): SystemLog[] => {
  const logs: SystemLog[] = []
  const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]
  const categories: LogCategory[] = ["USER", "SYSTEM", "API", "DATABASE", "SECURITY", "PERFORMANCE", "BUSINESS"]

  const messages = {
    USER: [
      "User logged in successfully",
      "User profile updated",
      "Password changed",
      "User account created",
      "User session expired",
      "Failed login attempt",
      "User preferences updated",
      "Account deactivated",
    ],
    SYSTEM: [
      "System startup completed",
      "Database connection established",
      "Cache cleared",
      "Scheduled maintenance started",
      "System configuration updated",
      "Service restarted",
      "Memory usage high",
      "Disk space warning",
    ],
    API: [
      "API request processed",
      "Rate limit exceeded",
      "Invalid API key",
      "Request timeout",
      "API endpoint deprecated",
      "External service unavailable",
      "Response time exceeded threshold",
      "API quota reached",
    ],
    DATABASE: [
      "Query executed successfully",
      "Connection pool exhausted",
      "Slow query detected",
      "Database backup completed",
      "Index optimization finished",
      "Transaction rolled back",
      "Deadlock detected",
      "Table locked",
    ],
    SECURITY: [
      "Suspicious activity detected",
      "Access denied",
      "Security scan completed",
      "Firewall rule updated",
      "Certificate renewed",
      "Intrusion attempt blocked",
      "Privilege escalation detected",
      "Audit log accessed",
    ],
    PERFORMANCE: [
      "Response time degraded",
      "CPU usage spike",
      "Memory leak detected",
      "Cache hit ratio low",
      "Network latency high",
      "Queue processing delayed",
      "Resource utilization optimal",
      "Performance benchmark completed",
    ],
    BUSINESS: [
      "Business plan created",
      "Plan section completed",
      "Collaboration session started",
      "Export generated",
      "Template applied",
      "Plan shared",
      "Analytics updated",
      "Report generated",
    ],
  }

  const users = [
    { id: "user1", email: "john.doe@example.com", name: "John Doe" },
    { id: "user2", email: "jane.smith@example.com", name: "Jane Smith" },
    { id: "user3", email: "mike.wilson@example.com", name: "Mike Wilson" },
    { id: "admin1", email: "admin@example.com", name: "Admin User" },
  ]

  // Generate logs for the last 30 days
  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

  for (let i = 0; i < 500; i++) {
    const timestamp = new Date(thirtyDaysAgo + Math.random() * (now - thirtyDaysAgo))
    const level = levels[Math.floor(Math.random() * levels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const user = Math.random() > 0.3 ? users[Math.floor(Math.random() * users.length)] : undefined
    const categoryMessages = messages[category]
    const message = categoryMessages[Math.floor(Math.random() * categoryMessages.length)]

    const log: SystemLog = {
      id: `log_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp.toISOString(),
      level,
      category,
      message,
      userId: user?.id,
      userEmail: user?.email,
      userName: user?.name,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      resource: `/api/${category.toLowerCase()}`,
      action: message.split(" ")[0].toLowerCase(),
      duration: Math.floor(Math.random() * 5000),
      statusCode: level === "ERROR" ? 500 : level === "WARN" ? 400 : 200,
    }

    // Add details for errors
    if (level === "ERROR" || level === "CRITICAL") {
      log.details = `Detailed error information for: ${message}`
      log.error = `${category}Error: ${message}`
      log.stack = `Error\n    at Function.${category}.process (/app/lib/${category.toLowerCase()}.js:123:45)\n    at /app/api/handler.js:67:89`
    }

    // Add metadata
    log.metadata = {
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: user ? `session_${Math.random().toString(36).substr(2, 9)}` : undefined,
      version: "1.0.0",
    }

    logs.push(log)
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// In-memory storage for demo purposes
let systemLogs: SystemLog[] = generateMockLogs()

export const getSystemLogs = async (
  page = 1,
  limit = 50,
  filters?: LogFilter,
): Promise<{ logs: SystemLog[]; total: number; pages: number }> => {
  let filteredLogs = [...systemLogs]

  // Apply filters
  if (filters) {
    if (filters.level && filters.level.length > 0) {
      filteredLogs = filteredLogs.filter((log) => filters.level!.includes(log.level))
    }

    if (filters.category && filters.category.length > 0) {
      filteredLogs = filteredLogs.filter((log) => filters.category!.includes(log.category))
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId)
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filteredLogs = filteredLogs.filter((log) => new Date(log.timestamp) <= toDate)
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm) ||
          log.details?.toLowerCase().includes(searchTerm) ||
          log.userEmail?.toLowerCase().includes(searchTerm) ||
          log.userName?.toLowerCase().includes(searchTerm) ||
          log.resource?.toLowerCase().includes(searchTerm),
      )
    }
  }

  const total = filteredLogs.length
  const pages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const logs = filteredLogs.slice(startIndex, endIndex)

  return { logs, total, pages }
}

export const exportLogs = async (options: LogExportOptions): Promise<string> => {
  const { logs } = await getSystemLogs(1, options.limit || 1000, options.filters)

  switch (options.format) {
    case "csv":
      return exportToCSV(logs)
    case "json":
      return JSON.stringify(logs, null, 2)
    case "txt":
      return exportToText(logs)
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

const exportToCSV = (logs: SystemLog[]): string => {
  const headers = [
    "ID",
    "Timestamp",
    "Level",
    "Category",
    "Message",
    "User",
    "IP Address",
    "Resource",
    "Action",
    "Status Code",
    "Duration",
    "Details",
  ]

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    log.level,
    log.category,
    `"${log.message.replace(/"/g, '""')}"`,
    log.userEmail || "",
    log.ipAddress || "",
    log.resource || "",
    log.action || "",
    log.statusCode || "",
    log.duration || "",
    `"${(log.details || "").replace(/"/g, '""')}"`,
  ])

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
}

const exportToText = (logs: SystemLog[]): string => {
  return logs
    .map((log) => {
      const lines = [
        `[${log.timestamp}] ${log.level} ${log.category}: ${log.message}`,
        log.userEmail ? `  User: ${log.userName} (${log.userEmail})` : "",
        log.ipAddress ? `  IP: ${log.ipAddress}` : "",
        log.resource ? `  Resource: ${log.resource}` : "",
        log.duration ? `  Duration: ${log.duration}ms` : "",
        log.details ? `  Details: ${log.details}` : "",
        log.error ? `  Error: ${log.error}` : "",
        "",
      ].filter(Boolean)

      return lines.join("\n")
    })
    .join("\n")
}

export const addSystemLog = async (log: Omit<SystemLog, "id" | "timestamp">): Promise<void> => {
  const newLog: SystemLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }

  systemLogs.unshift(newLog)

  // Keep only the last 10000 logs to prevent memory issues
  if (systemLogs.length > 10000) {
    systemLogs = systemLogs.slice(0, 10000)
  }
}

export const clearSystemLogs = async (): Promise<void> => {
  systemLogs = []
}

export const getLogStats = async (): Promise<{
  total: number
  byLevel: Record<LogLevel, number>
  byCategory: Record<LogCategory, number>
  last24Hours: number
}> => {
  const now = Date.now()
  const last24Hours = now - 24 * 60 * 60 * 1000

  const stats = {
    total: systemLogs.length,
    byLevel: {} as Record<LogLevel, number>,
    byCategory: {} as Record<LogCategory, number>,
    last24Hours: systemLogs.filter((log) => new Date(log.timestamp).getTime() > last24Hours).length,
  }

  // Initialize counters
  const levels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]
  const categories: LogCategory[] = ["USER", "SYSTEM", "API", "DATABASE", "SECURITY", "PERFORMANCE", "BUSINESS"]

  levels.forEach((level) => (stats.byLevel[level] = 0))
  categories.forEach((category) => (stats.byCategory[category] = 0))

  // Count logs
  systemLogs.forEach((log) => {
    stats.byLevel[log.level]++
    stats.byCategory[log.category]++
  })

  return stats
}
