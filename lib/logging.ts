import { randomUUID } from "crypto"
import type { AccessLog, ErrorLog, User } from "./user-types"

// In-memory storage for demo purposes
// In production, this would be stored in a database
const accessLogs: AccessLog[] = []
const errorLogs: ErrorLog[] = []

export const logAccess = async (
  user: User,
  action: string,
  resource: string,
  success = true,
  details?: string,
  request?: Request,
): Promise<void> => {
  const log: AccessLog = {
    id: randomUUID(),
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    action,
    resource,
    timestamp: new Date().toISOString(),
    success,
    details,
    ipAddress: getClientIP(request),
    userAgent: request?.headers.get("user-agent") || undefined,
  }

  accessLogs.push(log)
  console.log(`[ACCESS LOG] ${user.email} ${action} ${resource} - ${success ? "SUCCESS" : "FAILED"}`)
}

export const logError = async (
  error: string,
  errorType: ErrorLog["errorType"],
  severity: ErrorLog["severity"],
  url: string,
  user?: User,
  request?: Request,
  stack?: string,
  context?: Record<string, any>,
): Promise<void> => {
  const errorLog: ErrorLog = {
    id: randomUUID(),
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
    error,
    errorType,
    stack,
    timestamp: new Date().toISOString(),
    url,
    method: request?.method,
    userAgent: request?.headers.get("user-agent") || undefined,
    ipAddress: getClientIP(request),
    severity,
    resolved: false,
    context,
  }

  errorLogs.push(errorLog)
  console.error(`[ERROR LOG] ${severity} - ${errorType}: ${error}`, { user: user?.email, url, context })
}

export const getAccessLogs = async (limit = 100, offset = 0): Promise<AccessLog[]> => {
  return accessLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(offset, offset + limit)
}

export const getErrorLogs = async (
  limit = 100,
  offset = 0,
  severity?: ErrorLog["severity"],
  resolved?: boolean,
): Promise<ErrorLog[]> => {
  let filteredLogs = errorLogs

  if (severity) {
    filteredLogs = filteredLogs.filter((log) => log.severity === severity)
  }

  if (resolved !== undefined) {
    filteredLogs = filteredLogs.filter((log) => log.resolved === resolved)
  }

  return filteredLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(offset, offset + limit)
}

export const resolveError = async (errorId: string, resolvedBy: string): Promise<boolean> => {
  const errorIndex = errorLogs.findIndex((log) => log.id === errorId)
  if (errorIndex !== -1) {
    errorLogs[errorIndex].resolved = true
    errorLogs[errorIndex].resolvedBy = resolvedBy
    errorLogs[errorIndex].resolvedDate = new Date().toISOString()
    return true
  }
  return false
}

export const getErrorStats = async (): Promise<{
  total: number
  unresolved: number
  critical: number
  high: number
  medium: number
  low: number
}> => {
  const total = errorLogs.length
  const unresolved = errorLogs.filter((log) => !log.resolved).length
  const critical = errorLogs.filter((log) => log.severity === "CRITICAL").length
  const high = errorLogs.filter((log) => log.severity === "HIGH").length
  const medium = errorLogs.filter((log) => log.severity === "MEDIUM").length
  const low = errorLogs.filter((log) => log.severity === "LOW").length

  return { total, unresolved, critical, high, medium, low }
}

const getClientIP = (request?: Request): string | undefined => {
  if (!request) return undefined

  // Check various headers for client IP
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")
  const clientIP = request.headers.get("x-client-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (clientIP) {
    return clientIP
  }

  return undefined
}

// Helper function to get detailed error explanations
export const getErrorExplanation = (errorLog: ErrorLog): string => {
  const explanations: Record<string, string> = {
    API_ERROR: `This error occurred when trying to communicate with an external service or database. Common causes include network timeouts, service unavailability, or authentication failures. Check the API endpoint status and credentials.`,
    CLIENT_ERROR: `This error happened in the user's browser, typically due to JavaScript issues, network problems, or incompatible browser features. The user may need to refresh the page or update their browser.`,
    VALIDATION_ERROR: `The system rejected user input because it didn't meet the required format or constraints. This could be due to missing required fields, invalid data formats, or security validation failures.`,
    PERMISSION_ERROR: `The user attempted to access a resource or perform an action they don't have permission for. This could indicate a role/permission configuration issue or an attempt to access restricted content.`,
    SYSTEM_ERROR: `An unexpected system-level error occurred, such as memory issues, file system problems, or internal server errors. This typically requires technical investigation and may indicate infrastructure problems.`,
  }

  const baseExplanation = explanations[errorLog.errorType] || "An unknown error type occurred."

  let contextualInfo = ""
  if (errorLog.context) {
    if (errorLog.context.planId) {
      contextualInfo += ` Related to business plan: ${errorLog.context.planId}.`
    }
    if (errorLog.context.sectionId) {
      contextualInfo += ` Occurred in section: ${errorLog.context.sectionId}.`
    }
    if (errorLog.context.action) {
      contextualInfo += ` During action: ${errorLog.context.action}.`
    }
  }

  return baseExplanation + contextualInfo
}
