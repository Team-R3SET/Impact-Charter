"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock } from "lucide-react"

export function SessionManager() {
  const { getSessionInfo, extendSession, logout } = useUser()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const checkSession = () => {
      const sessionInfo = getSessionInfo()
      const remainingMinutes = Math.floor(sessionInfo.timeRemaining / (1000 * 60))

      setTimeRemaining(remainingMinutes)

      // Show warning when less than 5 minutes remain
      if (sessionInfo.isActive && remainingMinutes <= 5 && remainingMinutes > 0) {
        setShowWarning(true)
      } else if (remainingMinutes <= 0 && sessionInfo.isActive) {
        // Session expired
        logout()
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSession()

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [getSessionInfo, extendSession, logout])

  const handleExtendSession = () => {
    extendSession()
    setShowWarning(false)
  }

  if (!showWarning) return null

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                Session expires in {timeRemaining} minute{timeRemaining !== 1 ? "s" : ""}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExtendSession}
              className="ml-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900 bg-transparent"
            >
              Extend
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
