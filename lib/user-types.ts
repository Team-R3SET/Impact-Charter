export type UserRole = "administrator" | "regular"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company?: string
  department?: string
  createdDate: string
  lastLoginDate?: string
  isActive: boolean
  avatar?: string
}

export interface AccessLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  timestamp: string
  success: boolean
  details?: string
  ipAddress?: string
  userAgent?: string
}

export type ErrorType = "API_ERROR" | "CLIENT_ERROR" | "VALIDATION_ERROR" | "PERMISSION_ERROR" | "SYSTEM_ERROR"
export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface ErrorLog {
  id: string
  userId?: string
  userEmail?: string
  userName?: string
  error: string
  errorType: ErrorType
  stack?: string
  timestamp: string
  url: string
  method?: string
  userAgent?: string
  ipAddress?: string
  severity: ErrorSeverity
  resolved: boolean
  resolvedBy?: string
  resolvedDate?: string
  context?: Record<string, any>
}

export const isAdministrator = (user: User | null | undefined): boolean => {
  return !!user && user.role === "administrator"
}

export const canAccessAdminFeatures = (user: User | null | undefined): boolean => {
  return isAdministrator(user)
}

export const canViewLogs = (user: User | null | undefined): boolean => {
  return isAdministrator(user)
}

export const canManageUsers = (user: User | null | undefined): boolean => {
  return isAdministrator(user)
}
