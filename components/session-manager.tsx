"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock } from "lucide-react"

interface SessionManagerProps {
  showWarningAt?: number // minutes before expiry to show warning
  autoExtend?: boolean
}

export function SessionManager({ showWarningAt = 5, autoExtend = true }: SessionManagerProps) {
  const { getSessionInfo, extendSession, logout } = useUser()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const checkSession = () => {
      const sessionInfo = getSessionInfo()

      if (!sessionInfo.isActive) {
        setShowWarning(false)
        return
      }

      const minutesRemaining = Math.floor(sessionInfo.timeRemaining / (1000 * 60))
      setTimeRemaining(minutesRemaining)

      if (minutesRemaining <= showWarningAt && minutesRemaining > 0) {
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }

      // Auto-extend session if user is active and auto-extend is enabled
      if (autoExtend && minutesRemaining > 0 && minutesRemaining <= showWarningAt) {
        extendSession()
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSession()

    // Check every minute
    const interval = setInterval(checkSession, 60000)

    return () => clearInterval(interval)
  }, [getSessionInfo, extendSession, showWarningAt, autoExtend])

  const handleExtendSession = () => {
    extendSession()
    setShowWarning(false)
  }

  const handleLogout = () => {
    logout()
    setShowWarning(false)
  }

  if (!showWarning) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Session expires in {timeRemaining} minutes</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleExtendSession} className="bg-amber-600 hover:bg-amber-700">
              Extend Session
            </Button>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
