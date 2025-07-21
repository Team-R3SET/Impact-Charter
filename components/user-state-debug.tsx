"use client"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, User, Settings, Clock, Database } from "lucide-react"

export function UserStateDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const userState = useUser()
  const sessionInfo = userState.getSessionInfo()

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            {isOpen ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
            Debug State
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <Card className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                User State Debug
              </CardTitle>
              <CardDescription className="text-xs">Current application state information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Authentication Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span className="font-medium">Authentication</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={userState.isAuthenticated ? "default" : "secondary"} className="text-xs">
                      {userState.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Loading:</span>
                    <Badge variant={userState.isLoading ? "destructive" : "outline"} className="text-xs">
                      {userState.isLoading ? "Loading" : "Ready"}
                    </Badge>
                  </div>
                  {userState.user && (
                    <>
                      <div className="flex justify-between">
                        <span>User:</span>
                        <span className="truncate max-w-32">{userState.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <Badge variant="outline" className="text-xs">
                          {userState.user.role}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Session Info */}
              {userState.session && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">Session</span>
                  </div>
                  <div className="pl-5 space-y-1">
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <Badge variant={sessionInfo.isActive ? "default" : "destructive"} className="text-xs">
                        {sessionInfo.isActive ? "Active" : "Expired"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span>{formatDuration(sessionInfo.timeRemaining)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Login:</span>
                      <span className="text-xs">{formatTime(userState.session.loginTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Activity:</span>
                      <span className="text-xs">{formatTime(userState.session.lastActivity)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  <span className="font-medium">Preferences</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="flex justify-between">
                    <span>Theme:</span>
                    <Badge variant="outline" className="text-xs">
                      {userState.preferences.theme}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Save:</span>
                    <Badge variant={userState.preferences.autoSave ? "default" : "secondary"} className="text-xs">
                      {userState.preferences.autoSave ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Notifications:</span>
                    <Badge variant={userState.preferences.notifications ? "default" : "secondary"} className="text-xs">
                      {userState.preferences.notifications ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Collaboration:</span>
                    <Badge variant="outline" className="text-xs">
                      {userState.preferences.collaborationMode}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Storage Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3" />
                  <span className="font-medium">Storage</span>
                </div>
                <div className="pl-5 space-y-1">
                  <div className="flex justify-between">
                    <span>Local Storage:</span>
                    <Badge variant="outline" className="text-xs">
                      {typeof window !== "undefined" && window.localStorage ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Storage:</span>
                    <Badge variant="outline" className="text-xs">
                      {typeof window !== "undefined" && window.sessionStorage ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => userState.extendSession()}
                  disabled={!userState.session}
                  className="text-xs"
                >
                  Extend Session
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => userState.logout()}
                  disabled={!userState.isAuthenticated}
                  className="text-xs"
                >
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
