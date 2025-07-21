"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/contexts/user-context"
import { getDemoUsers } from "@/lib/user-management"
import { RefreshCw, User, Shield } from "lucide-react"

export function UserSwitcherDebug() {
  const { user: currentUser, switchUser, isLoading, isAdmin } = useUser()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const demoUsers = getDemoUsers()

  const handleDebugInfo = () => {
    const info = {
      currentUser,
      isLoading,
      isAdmin,
      availableUsers: demoUsers.length,
      localStorage: typeof window !== "undefined" ? localStorage.getItem("user-state") : null,
    }
    setDebugInfo(info)
    console.log("User Switcher Debug Info:", info)
  }

  const handleQuickSwitch = (userId: string) => {
    const user = demoUsers.find((u) => u.id === userId)
    if (user) {
      switchUser(user)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          User Switcher Debug Panel
        </CardTitle>
        <CardDescription>Debug and test the user switching functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Current User</h3>
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs mt-1">
                  {isAdmin ? "Admin" : "User"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No user logged in</p>
          )}
        </div>

        {/* Quick Switch Buttons */}
        <div>
          <h3 className="font-semibold mb-2">Quick Switch</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map((user) => (
              <Button
                key={user.id}
                variant={currentUser?.id === user.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleQuickSwitch(user.id)}
                className="justify-start"
                disabled={isLoading}
              >
                {user.role === "ADMIN" ? <Shield className="h-3 w-3 mr-2" /> : <User className="h-3 w-3 mr-2" />}
                {user.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div>
          <Button onClick={handleDebugInfo} variant="outline" size="sm">
            Show Debug Info
          </Button>
          {debugInfo && (
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2 text-sm">
          <Badge variant={isLoading ? "destructive" : "secondary"}>Loading: {isLoading ? "Yes" : "No"}</Badge>
          <Badge variant={currentUser ? "default" : "destructive"}>Authenticated: {currentUser ? "Yes" : "No"}</Badge>
          <Badge variant={isAdmin ? "destructive" : "secondary"}>Admin: {isAdmin ? "Yes" : "No"}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
