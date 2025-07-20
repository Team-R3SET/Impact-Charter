"use client"

import { useOthers, useMyPresence } from "@/lib/liveblocks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function PresenceIndicator() {
  const others = useOthers()
  const [myPresence] = useMyPresence()

  const activeUsers = others.map((other) => other.presence?.user).filter(Boolean)

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {activeUsers.slice(0, 3).map((user, index) => (
          <Avatar key={index} className="w-8 h-8 border-2 border-background">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="text-xs">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {activeUsers.length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{activeUsers.length - 3}
        </Badge>
      )}
      {activeUsers.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {activeUsers.length} collaborator{activeUsers.length !== 1 ? "s" : ""} online
        </span>
      )}
    </div>
  )
}
