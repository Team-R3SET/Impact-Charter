"use client"

import { useRoom, useOthers, useMyPresence } from "@liveblocks/react/suspense"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Eye, Edit3 } from "lucide-react"

export function LivePresenceHeader() {
  const room = useRoom()
  const others = useOthers()
  const [myPresence] = useMyPresence()

  const onlineUsers = others.filter((user) => user.presence?.status === "online")

  if (onlineUsers.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {onlineUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.connectionId}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-8 w-8 ring-2 ring-white/20 border-2 border-white">
                    <AvatarImage
                      src={user.info?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.info?.email}`}
                      alt={user.info?.name || "User"}
                    />
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {(user.info?.name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.presence?.isTyping && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Edit3 className="w-2 h-2 text-white" />
                    </div>
                  )}
                  {user.presence?.currentSection && !user.presence?.isTyping && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Eye className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <p className="font-medium">{user.info?.name || "Anonymous"}</p>
                  {user.presence?.currentSection && (
                    <p className="text-xs text-muted-foreground">
                      {user.presence.isTyping ? "Editing" : "Viewing"}: {user.presence.currentSection}
                    </p>
                  )}
                  <Badge variant="outline" className="text-xs mt-1">
                    Online
                  </Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {onlineUsers.length > 3 && (
          <Badge variant="secondary" className="text-xs bg-white/10 text-white border-white/20">
            +{onlineUsers.length - 3}
          </Badge>
        )}

        <div className="flex items-center gap-1 text-xs text-white/70">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>{onlineUsers.length} online</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
