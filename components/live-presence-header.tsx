"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useOthers, useMyPresence, useRoom } from "@/lib/liveblocks"

export function LivePresenceHeader() {
  const room = useRoom()
  const others = useOthers()
  const [myPresence] = useMyPresence()

  // If we’re not inside a RoomProvider (e.g. on non-plan pages),
  // silently render nothing to avoid “RoomProvider is missing” errors.
  if (!room) {
    return null
  }

  const activeUsers = others.filter((user) => user.presence?.user)
  const totalUsers = activeUsers.length + 1 // +1 for current user

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex items-center -space-x-2">
          {/* Current user indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="w-8 h-8 ring-2 ring-white/20 bg-white/10">
                  <AvatarImage src={myPresence?.user?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-white text-xs">
                    {myPresence?.user?.name?.charAt(0).toUpperCase() || "Y"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>You ({myPresence?.user?.name || "Anonymous"})</p>
            </TooltipContent>
          </Tooltip>

          {/* Other users */}
          {activeUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="w-8 h-8 ring-2 ring-white/20 bg-white/10">
                    <AvatarImage src={user.presence?.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-white text-xs">
                      {user.presence?.user?.name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.presence?.user?.name || "Anonymous"}</p>
                {user.presence?.selectedSection && (
                  <p className="text-xs text-muted-foreground">Viewing: {user.presence.selectedSection}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Show count if more than 3 users */}
          {activeUsers.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 bg-white/10 rounded-full ring-2 ring-white/20 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">+{activeUsers.length - 3}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {activeUsers.length - 3} more user{activeUsers.length - 3 > 1 ? "s" : ""}
                </p>
              </TooltipContent>
            </Tooltip>
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
