/**
 * Central type & role-helper definitions for the Business-Planning app.
 * Any module that needs user/role information should import from here.
 */

export type UserRole = "administrator" | "regular"

/**
 * Shape of a signed-in user record used on both client & server.
 * In a production app this would come from your auth provider / database.
 */
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

/**
 * Single row in the access-log audit trail.
 */
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

/**
 * Allowed error categories for richer filtering & explanations.
 */
export type ErrorType = "API_ERROR" | "CLIENT_ERROR" | "VALIDATION_ERROR" | "PERMISSION_ERROR" | "SYSTEM_ERROR"

/**
 * Severity tiers adopted across the app.
 */
export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

/**
 * Single row in the error-log table.
 */
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

/* ------------------------------------------------------------------ */
/*                          ROLE-HELPER UTILS                         */
/* ------------------------------------------------------------------ */

/**
 * Returns `true` when the given user is an administrator.
 */
export const isAdministrator = (user: User | null | undefined): boolean => !!user && user.role === "administrator"

/**
 * Top-level guard used throughout the UI (e.g. to show /admin link).
 */
export const canAccessAdminFeatures = (user: User | null | undefined): boolean => isAdministrator(user)

/**
 * Administrators can view system logs. Extend if you want wider access.
 */
export const canViewLogs = (user: User | null | undefined): boolean => isAdministrator(user)

/**
 * Administrators can create / deactivate users. Extend if needed.
 */
export const canManageUsers = (user: User | null | undefined): boolean => isAdministrator(user)
