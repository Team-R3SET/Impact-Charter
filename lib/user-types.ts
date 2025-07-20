export type UserRole = "administrator" | "regular"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  company?: string
  department?: string
  createdDate: string
  lastLoginDate?: string
  isActive: boolean
}

export interface AccessLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string
  resource: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  details?: string
}

export interface ErrorLog {
  id: string
  userId?: string
  userEmail?: string
  userName?: string
  error: string
  errorType: "API_ERROR" | "CLIENT_ERROR" | "VALIDATION_ERROR" | "PERMISSION_ERROR" | "SYSTEM_ERROR"
  stack?: string
  timestamp: string
  url: string
  method?: string
  userAgent?: string
  ipAddress?: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  resolved: boolean
  resolvedBy?: string
  resolvedDate?: string
  context?: Record<string, any>
}

export const isAdministrator = (user: User): boolean => {
  return user.role === "administrator"
}

export const canAccessAdminFeatures = (user: User): boolean => {
  return isAdministrator(user)
}

export const canViewLogs = (user: User): boolean => {
  return isAdministrator(user)
}

export const canManageUsers = (user: User): boolean => {
  return isAdministrator(user)
}
