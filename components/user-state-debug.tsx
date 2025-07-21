"use client"

import { useState } from "react"
import { useUser } from "@/contexts/user-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Bug, User, Settings, Clock } from "lucide-react"

export function UserStateDebug() {
  const [isOpen, setIsOpen] = useState(false)
  const userContext = useUser()

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTimeUntilExpiry = () => {
    if (!userContext.sessionExpiry) return "N/A"
    const now = Date.now()
    const diff = userContext.sessionExpiry - now
    if (diff <= 0) return "Expired"

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Bug className="h-4 w-4" />
            Debug State
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bug className="h-4 w-4" />
                User State Debug
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Status:
                </span>
                <Badge variant={userContext.isAuthenticated ? "default" : "secondary"}>
                  {userContext.isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>

              {userContext.user && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>User:</span>
                    <span className="font-mono">{userContext.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <Badge variant="outline">{userContext.user.role}</Badge>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Session:
                </span>
                <span className="font-mono">{getTimeUntilExpiry()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Settings className="h-3 w-3" />
                  Theme:
                </span>
                <span className="font-mono">{userContext.preferences.theme}</span>
              </div>

              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span className="font-mono text-xs">{formatTime(userContext.lastActivity)}</span>
              </div>

              {userContext.sessionId && (
                <div className="flex justify-between">
                  <span>Session ID:</span>
                  <span className="font-mono text-xs">{userContext.sessionId.slice(-8)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
