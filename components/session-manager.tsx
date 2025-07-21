"use client"

import { useEffect } from "react"
import { useUser } from "@/contexts/user-context"
import { toast } from "@/hooks/use-toast"

export function SessionManager() {
  const { isAuthenticated, sessionExpiry, logout } = useUser()

  useEffect(() => {
    if (!isAuthenticated || !sessionExpiry) return

    const checkSession = () => {
      const now = Date.now()
      const timeUntilExpiry = sessionExpiry - now

      // Show warning 5 minutes before expiry
      if (timeUntilExpiry <= 5 * 60 * 1000 && timeUntilExpiry > 0) {
        toast({
          title: "Session Expiring Soon",
          description: "Your session will expire in 5 minutes. Please save your work.",
          variant: "destructive",
        })
      }

      // Auto-logout when session expires
      if (timeUntilExpiry <= 0) {
        logout()
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        })
      }
    }

    const interval = setInterval(checkSession, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [isAuthenticated, sessionExpiry, logout])

  return null
}
