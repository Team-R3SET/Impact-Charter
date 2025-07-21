"use client"

import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"

export function UserStateDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const { user, preferences, session, isAuthenticated, isLoading, getSessionInfo } = useUser()

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const sessionInfo = getSessionInfo()

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button size="sm" variant="outline" onClick={() => setIsVisible(!isVisible)} className="mb-2">
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        Debug
      </Button>

      {isVisible && (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User State Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <strong>Authentication:</strong>
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="ml-2">
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>

            <div>
              <strong>Loading:</strong>
              <Badge variant={isLoading ? "destructive" : "default"} className="ml-2">
                {isLoading ? "Loading" : "Ready"}
              </Badge>
            </div>

            {user && (
              <div>
                <strong>User:</strong>
                <div className="ml-2 mt-1 p-2 bg-muted rounded text-xs">
                  <div>Name: {user.name}</div>
                  <div>Email: {user.email}</div>
                  <div>Role: {user.role}</div>
                  <div>ID: {user.id}</div>
                </div>
              </div>
            )}

            <div>
              <strong>Session:</strong>
              <div className="ml-2 mt-1 p-2 bg-muted rounded text-xs">
                <div>Active: {sessionInfo.isActive ? "Yes" : "No"}</div>
                <div>Time Remaining: {Math.floor(sessionInfo.timeRemaining / (1000 * 60))} min</div>
                {session && (
                  <>
                    <div>ID: {session.id}</div>
                    <div>Expires: {new Date(session.expiresAt).toLocaleString()}</div>
                  </>
                )}
              </div>
            </div>

            <div>
              <strong>Preferences:</strong>
              <div className="ml-2 mt-1 p-2 bg-muted rounded text-xs">
                <div>Theme: {preferences.theme}</div>
                <div>Auto-save: {preferences.autoSave ? "On" : "Off"}</div>
                <div>Notifications: {preferences.notifications ? "On" : "Off"}</div>
                <div>View: {preferences.defaultPlanView}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
