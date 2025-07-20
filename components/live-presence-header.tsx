"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useRoom, useOthers, useMyPresence } from "@/lib/liveblocks"

export function LivePresenceHeader() {
  const room = useRoom()
  const others = useOthers()
  const myPresence = useMyPresence()

  if (!room) {
    return null
  }

  const totalUsers = others.length + 1 // +1 for current user

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {/* Current user */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="w-8 h-8 border-2 border-white/20 ring-2 ring-green-500">
                <AvatarImage
                  src={myPresence?.user?.avatar || "/placeholder.svg"}
                  alt={myPresence?.user?.name || "You"}
                />
                <AvatarFallback className="bg-green-500 text-white text-xs">
                  {(myPresence?.user?.name || "You").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{myPresence?.user?.name || "You"} (You)</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </TooltipContent>
          </Tooltip>

          {/* Other users */}
          {others.slice(0, 4).map((other, index) => (
            <Tooltip key={other.connectionId}>
              <TooltipTrigger asChild>
                <Avatar className="w-8 h-8 border-2 border-white/20">
                  <AvatarImage
                    src={other.presence?.user?.avatar || "/placeholder.svg"}
                    alt={other.presence?.user?.name || "User"}
                  />
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {(other.presence?.user?.name || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{other.presence?.user?.name || "Anonymous User"}</p>
                <p className="text-xs text-muted-foreground">
                  {other.presence?.selectedSection ? `Viewing: ${other.presence.selectedSection}` : "Online"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Overflow indicator */}
          {others.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
              <span className="text-xs font-medium text-white">+{others.length - 4}</span>
            </div>
          )}
        </div>

        {totalUsers > 1 && (
          <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
            {totalUsers} online
          </Badge>
        )}
      </div>
    </TooltipProvider>
  )
}
