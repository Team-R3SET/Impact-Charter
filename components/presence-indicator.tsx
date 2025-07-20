"use client"

import { useOthers, useMyPresence } from "@/lib/liveblocks"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PresenceIndicator() {
  const others = useOthers()
  const [myPresence] = useMyPresence()

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {others.map(({ connectionId, presence }) => (
          <Avatar key={connectionId} className="w-8 h-8 border-2 border-background">
            <AvatarImage src={presence.user?.avatar || "/placeholder.svg"} alt={presence.user?.name} />
            <AvatarFallback className="text-xs">{presence.user?.name?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {others.length > 0 && (
        <span className="text-sm text-muted-foreground">
          {others.length} other{others.length === 1 ? "" : "s"} online
        </span>
      )}
    </div>
  )
}
