import type { User } from "./user-types"
import { getUserById } from "./user-management" // <-- if getUserById already exists, this is a no-op

/**
 * Return the current user object from an email address.
 * In the demo we just do a simple lookup; replace with real auth in production.
 */
export async function getCurrentUser(email: string): Promise<User | null> {
  return getUserById ? getUserById(email) : null
}

/** True if the user has permission to view admin logs. */
export function canViewLogs(user: User | null | undefined): boolean {
  return !!user && (user.role === "administrator" || user.role === "super_admin")
}

/**
 * Demo-only password reset helper.
 * Always returns true and logs the action.
 */
export async function resetUserPassword(userId: string): Promise<boolean> {
  console.log(`(demo) reset password for user ${userId}`)
  return true
}
