"use client"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, RefreshCw, Trash2, User, Settings, Clock } from "lucide-react"

export function UserStateDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, preferences, session, isAuthenticated, getSessionInfo, extendSession, logout } = useUser()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const sessionInfo = getSessionInfo()
  const timeRemaining = Math.floor(sessionInfo.timeRemaining / (1000 * 60))

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-background/95 backdrop-blur">
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User State Debug
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <Card className="bg-background/95 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                Current State
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* User Info */}
              {user && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <User className="h-3 w-3" />
                    User
                  </div>
                  <div className="pl-5 space-y-1 text-muted-foreground">
                    <div>Name: {user.name}</div>
                    <div>Email: {user.email}</div>
                    <div>Role: {user.role}</div>
                    <div>ID: {user.id}</div>
                  </div>
                </div>
              )}

              {/* Session Info */}
              {session && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Clock className="h-3 w-3" />
                    Session
                  </div>
                  <div className="pl-5 space-y-1 text-muted-foreground">
                    <div>Active: {sessionInfo.isActive ? "Yes" : "No"}</div>
                    <div>Time Remaining: {timeRemaining}m</div>
                    <div>Created: {new Date(session.createdAt).toLocaleTimeString()}</div>
                    <div>Expires: {new Date(session.expiresAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <Settings className="h-3 w-3" />
                  Preferences
                </div>
                <div className="pl-5 space-y-1 text-muted-foreground">
                  <div>Theme: {preferences.theme}</div>
                  <div>Notifications: {preferences.notifications ? "On" : "Off"}</div>
                  <div>Auto-save: {preferences.autoSave ? "On" : "Off"}</div>
                  <div>Language: {preferences.language}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={extendSession} disabled={!session}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Extend
                </Button>
                <Button size="sm" variant="outline" onClick={logout} disabled={!isAuthenticated}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
