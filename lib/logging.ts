import type { AccessLog, ErrorLog, ErrorType, ErrorSeverity } from "@/lib/user-types"

const accessLogs: AccessLog[] = []
const errorLogs: ErrorLog[] = []

export const logAccess = async (log: Omit<AccessLog, "id" | "timestamp">): Promise<void> => {
  const accessLog: AccessLog = {
    ...log,
    id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  accessLogs.push(accessLog)
  console.log("[ACCESS LOG]", accessLog)
}

export const logError = async (
  error: string,
  errorType: ErrorType,
  severity: ErrorSeverity,
  context?: {
    userId?: string
    userEmail?: string
    userName?: string
    url?: string
    method?: string
    stack?: string
    userAgent?: string
    ipAddress?: string
    additionalContext?: Record<string, any>
  },
): Promise<void> => {
  const errorLog: ErrorLog = {
    id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    error,
    errorType,
    severity,
    timestamp: new Date().toISOString(),
    resolved: false,
    userId: context?.userId,
    userEmail: context?.userEmail,
    userName: context?.userName,
    url: context?.url || "",
    method: context?.method,
    stack: context?.stack,
    userAgent: context?.userAgent,
    ipAddress: context?.ipAddress,
    context: context?.additionalContext,
  }
  errorLogs.push(errorLog)
  console.error("[ERROR LOG]", errorLog)
}

export const logInfo = async (message: string, context?: Record<string, any>) => {
  console.info("[INFO]", { message, ...context })
}

export const getAccessLogs = async (limit?: number): Promise<AccessLog[]> => {
  const logs = [...accessLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return limit ? logs.slice(0, limit) : logs
}

export const getErrorLogs = async (limit?: number): Promise<ErrorLog[]> => {
  const logs = [...errorLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return limit ? logs.slice(0, limit) : logs
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

export const getErrorExplanation = (errorType: ErrorType, error: string): string => {
  const explanations: Record<ErrorType, string> = {
    API_ERROR: `This is a server-side API error. The error "${error}" occurred while processing a request. This could be due to database connectivity issues, external service failures, or server configuration problems. Check server logs and ensure all services are running properly.`,
    CLIENT_ERROR: `This is a client-side error that occurred in the user's browser. The error "${error}" suggests an issue with the frontend code, network connectivity, or browser compatibility. Users may need to refresh the page or clear their browser cache.`,
    VALIDATION_ERROR: `This is a data validation error. The error "${error}" indicates that user input or data doesn't meet the required format or constraints. Review the validation rules and ensure users are provided with clear guidance on expected input formats.`,
    PERMISSION_ERROR: `This is an authorization/permission error. The error "${error}" suggests a user attempted to access a resource or perform an action they don't have permission for. Review user roles and permissions, and ensure proper access controls are in place.`,
    SYSTEM_ERROR: `This is a system-level error. The error "${error}" indicates a deeper infrastructure or configuration issue. This may require administrator intervention to resolve. Check system resources, configurations, and dependencies.`,
  }
  return (
    explanations[errorType] ||
    `An error of type "${errorType}" occurred: ${error}. Please investigate the specific error message and context for more details.`
  )
}
