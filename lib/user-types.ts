/**
 * Shared user, log and role-helper types for the Business-Planning app.
 * Import from "@/lib/user-types" everywhere you need them.
 */

/* ------------------------------------------------------------------ */
/*                               USERS                                 */
/* ------------------------------------------------------------------ */

export type UserRole = "administrator" | "regular"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  company?: string
  department?: string
  createdDate: string // ISO string
  lastLoginDate?: string // ISO string
  isActive: boolean
  avatar?: string // URL
}

/* ------------------------------------------------------------------ */
/*                         ACCESS / ERROR LOGS                         */
/* ------------------------------------------------------------------ */

export interface AccessLog {
  id: string
  userId: string
  userEmail: string
  userName: string
  action: string // e.g. "SAVE_SECTION"
  resource: string // e.g. "/api/.../complete"
  timestamp: string // ISO string
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
  timestamp: string // ISO string
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
/*                         ROLE-HELPER UTILITIES                       */
/* ------------------------------------------------------------------ */

/** True when the supplied user record is an administrator. */
export const isAdministrator = (user: User | null | undefined): boolean => !!user && user.role === "administrator"

/** Admins get access to the admin dashboard & extra UI. */
export const canAccessAdminFeatures = (user: User | null | undefined): boolean => isAdministrator(user)

/** Admins can view access/error logs. */
export const canViewLogs = (user: User | null | undefined): boolean => isAdministrator(user)

/** Admins can manage (create / deactivate) users. */
export const canManageUsers = (user: User | null | undefined): boolean => isAdministrator(user)
