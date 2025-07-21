"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, RefreshCw } from "lucide-react"

interface SessionManagerProps {
  showWarningAt?: number // Minutes before expiry to show warning
  autoExtend?: boolean // Automatically extend session on activity
}

export function SessionManager({ showWarningAt = 30, autoExtend = true }: SessionManagerProps) {
  const { session, getSessionInfo, extendSession, logout } = useUser()
  const [sessionInfo, setSessionInfo] = useState(getSessionInfo())
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      const info = getSessionInfo()
      setSessionInfo(info)

      // Show warning when session is about to expire
      const minutesRemaining = info.timeRemaining / (1000 * 60)
      setShowWarning(info.isActive && minutesRemaining <= showWarningAt && minutesRemaining > 0)

      // Auto-logout when session expires
      if (!info.isActive && info.timeRemaining <= 0) {
        logout()
      }
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [session, getSessionInfo, logout, showWarningAt])

  // Auto-extend session on user activity (if enabled)
  useEffect(() => {
    if (!autoExtend || !session) return

    const handleActivity = () => {
      const info = getSessionInfo()
      const minutesRemaining = info.timeRemaining / (1000 * 60)

      // Extend session if less than half the duration remains
      if (minutesRemaining < 12 * 60) {
        // 12 hours
        extendSession()
      }
    }

    const events = ["mousedown", "keypress", "scroll", "touchstart"]
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [session, autoExtend, extendSession, getSessionInfo])

  if (!session || !sessionInfo.isActive) {
    return null
  }

  const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const progressPercentage = Math.max(0, Math.min(100, (sessionInfo.timeRemaining / (24 * 60 * 60 * 1000)) * 100))

  if (showWarning) {
    return (
      <div className="fixed top-20 right-4 z-50 w-80">
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="space-y-3">
              <p className="font-medium">Session Expiring Soon</p>
              <p className="text-sm">Your session will expire in {formatTimeRemaining(sessionInfo.timeRemaining)}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={extendSession} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Extend Session
                </Button>
                <Button size="sm" variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Card className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Session Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Time Remaining</span>
            <span>{formatTimeRemaining(sessionInfo.timeRemaining)}</span>
          </div>
          <Progress value={progressPercentage} className="h-1" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              Last activity: {new Date(sessionInfo.lastActivity || "").toLocaleTimeString()}
            </span>
            <Button size="sm" variant="ghost" onClick={extendSession} className="h-6 px-2 text-xs">
              <RefreshCw className="w-3 h-3 mr-1" />
              Extend
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
