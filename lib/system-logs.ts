export interface SystemLog {
  id: string
  timestamp: Date
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL"
  category: "USER" | "SYSTEM" | "API" | "DATABASE" | "SECURITY" | "PERFORMANCE" | "BUSINESS"
  message: string
  details?: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  duration?: number
  stackTrace?: string
  metadata?: Record<string, any>
}

export interface LogFilters {
  search?: string
  levels?: string[]
  categories?: string[]
  startDate?: Date
  endDate?: Date
  userId?: string
}

export interface LogStats {
  total: number
  debug: number
  info: number
  warn: number
  error: number
  critical: number
  categories: Record<string, number>
  last24Hours: number
}

// Mock data generator for demo purposes
export function generateMockLogs(count = 100): SystemLog[] {
  const logs: SystemLog[] = []
  const levels: SystemLog["level"][] = ["DEBUG", "INFO", "WARN", "ERROR", "CRITICAL"]
  const categories: SystemLog["category"][] = [
    "USER",
    "SYSTEM",
    "API",
    "DATABASE",
    "SECURITY",
    "PERFORMANCE",
    "BUSINESS",
  ]

  const messages = {
    USER: [
      "User logged in successfully",
      "User profile updated",
      "Password reset requested",
      "User account created",
      "User session expired",
      "Failed login attempt",
    ],
    SYSTEM: [
      "System startup completed",
      "Database connection established",
      "Cache cleared successfully",
      "Backup process started",
      "Configuration updated",
      "Service health check passed",
    ],
    API: [
      "API request processed",
      "Rate limit exceeded",
      "Invalid API key provided",
      "Request timeout occurred",
      "Response cached successfully",
      "API endpoint deprecated",
    ],
    DATABASE: [
      "Query executed successfully",
      "Connection pool exhausted",
      "Database migration completed",
      "Slow query detected",
      "Transaction rolled back",
      "Index optimization completed",
    ],
    SECURITY: [
      "Suspicious activity detected",
      "Access denied - insufficient permissions",
      "Security scan completed",
      "Potential SQL injection blocked",
      "SSL certificate renewed",
      "Firewall rule updated",
    ],
    PERFORMANCE: [
      "High memory usage detected",
      "Response time threshold exceeded",
      "CPU usage spike detected",
      "Disk space running low",
      "Performance optimization applied",
      "Load balancer health check failed",
    ],
    BUSINESS: [
      "Business plan created",
      "Collaboration session started",
      "Document exported",
      "User subscription updated",
      "Payment processed successfully",
      "Analytics report generated",
    ],
  }

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const message = messages[category][Math.floor(Math.random() * messages[category].length)]

    const log: SystemLog = {
      id: `log_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      level,
      category,
      message,
      details: Math.random() > 0.7 ? `Additional details for ${message.toLowerCase()}` : undefined,
      userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 100)}` : undefined,
      userEmail: Math.random() > 0.5 ? `user${Math.floor(Math.random() * 100)}@example.com` : undefined,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: Math.random() > 0.5 ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" : undefined,
      requestId: Math.random() > 0.6 ? `req_${Math.random().toString(36).substr(2, 9)}` : undefined,
      duration: Math.random() > 0.4 ? Math.floor(Math.random() * 5000) : undefined,
      stackTrace: level === "ERROR" || level === "CRITICAL" ? generateStackTrace() : undefined,
      metadata:
        Math.random() > 0.6
          ? {
              component: category.toLowerCase(),
              version: "1.0.0",
              environment: "production",
            }
          : undefined,
    }

    logs.push(log)
  }

  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

function generateStackTrace(): string {
  return `Error: ${["Database connection failed", "Invalid user input", "Network timeout", "Memory allocation failed"][Math.floor(Math.random() * 4)]}
    at Object.handleRequest (/app/src/handlers/request.js:45:12)
    at processRequest (/app/src/middleware/auth.js:23:8)
    at IncomingMessage.<anonymous> (/app/src/server.js:67:5)
    at IncomingMessage.emit (events.js:315:20)
    at addChunk (_stream_readable.js:295:12)
    at readableAddChunk (_stream_readable.js:271:9)
    at IncomingMessage.Readable.push (_stream_readable.js:212:10)
    at HTTPParser.parserOnBody (_http_common.js:126:24)`
}

export function filterLogs(logs: SystemLog[], filters: LogFilters): SystemLog[] {
  return logs.filter((log) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (
        !log.message.toLowerCase().includes(searchLower) &&
        !log.details?.toLowerCase().includes(searchLower) &&
        !log.userEmail?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (filters.levels && filters.levels.length > 0 && !filters.levels.includes(log.level)) {
      return false
    }

    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(log.category)) {
      return false
    }

    if (filters.startDate && log.timestamp < filters.startDate) {
      return false
    }

    if (filters.endDate && log.timestamp > filters.endDate) {
      return false
    }

    if (filters.userId && log.userId !== filters.userId) {
      return false
    }

    return true
  })
}

export function calculateLogStats(logs: SystemLog[]): LogStats {
  const stats: LogStats = {
    total: logs.length,
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
    critical: 0,
    categories: {},
    last24Hours: 0,
  }

  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

  logs.forEach((log) => {
    // Count by level
    switch (log.level) {
      case "DEBUG":
        stats.debug++
        break
      case "INFO":
        stats.info++
        break
      case "WARN":
        stats.warn++
        break
      case "ERROR":
        stats.error++
        break
      case "CRITICAL":
        stats.critical++
        break
    }

    // Count by category
    stats.categories[log.category] = (stats.categories[log.category] || 0) + 1

    // Count last 24 hours
    if (log.timestamp > last24Hours) {
      stats.last24Hours++
    }
  })

  return stats
}
