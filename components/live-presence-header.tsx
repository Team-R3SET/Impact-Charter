"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "away" | "offline"
}

// Safe presence component that doesn't rely on Liveblocks hooks
export function LivePresenceHeader() {
  const [users, setUsers] = useState<User[]>([])
  const [isInRoom, setIsInRoom] = useState(false)

  useEffect(() => {
    // Check if we're in a collaborative context
    const checkRoomContext = () => {
      const roomElement = document.querySelector("[data-liveblocks-room]")
      const isCollabActive = window.location.search.includes("collab=true")
      setIsInRoom(!!(roomElement || isCollabActive))
    }

    checkRoomContext()

    // Listen for URL changes
    const handleUrlChange = () => {
      checkRoomContext()
    }

    window.addEventListener("popstate", handleUrlChange)
    return () => window.removeEventListener("popstate", handleUrlChange)
  }, [])

  useEffect(() => {
    // Simulate users when in collaborative mode
    if (isInRoom) {
      const demoUsers: User[] = [
        {
          id: "current-user",
          name: "Demo User",
          email: "user@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
          status: "online",
        },
        {
          id: "alice",
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          status: "online",
        },
      ]
      setUsers(demoUsers)
    } else {
      setUsers([])
    }
  }, [isInRoom])

  // Don't render if not in collaborative mode
  if (!isInRoom || users.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
        <Users className="w-4 h-4 text-white/80" />
        <div className="flex -space-x-2">
          {users.slice(0, 4).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <div className="relative">
                  <Avatar className="w-6 h-6 border-2 border-white/20">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-xs bg-white/20 text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${
                      user.status === "online"
                        ? "bg-green-500"
                        : user.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                    }`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {users.length > 4 && (
          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
            +{users.length - 4}
          </Badge>
        )}
        <span className="text-xs text-white/80 ml-1">{users.length} online</span>
      </div>
    </TooltipProvider>
  )
}
