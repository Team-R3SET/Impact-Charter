"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Eye, Edit3, MessageCircle } from 'lucide-react'

let useOthers: any = null
let useMyPresence: any = null

try {
  const liveblocks = require("@/lib/liveblocks")
  useOthers = liveblocks.useOthers
  useMyPresence = liveblocks.useMyPresence
} catch (error) {
  console.warn("Liveblocks not available for presence indicators")
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  status: "online" | "away" | "offline"
  activity?: "viewing" | "editing" | "commenting"
  section?: string
  lastSeen?: Date
}

// Enhanced presence component with real LiveBlocks integration
export function LivePresenceHeader() {
  const [fallbackUsers, setFallbackUsers] = useState<User[]>([])
  const [isInRoom, setIsInRoom] = useState(false)
  
  const others = useOthers ? useOthers() : []
  const [myPresence] = useMyPresence ? useMyPresence() : [null]

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
    if (isInRoom && !useOthers) {
      const demoUsers: User[] = [
        {
          id: "current-user",
          name: "Demo User",
          email: "user@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
          status: "online",
          activity: "editing",
          section: "Executive Summary",
          lastSeen: new Date(),
        },
        {
          id: "alice",
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          status: "online",
          activity: "viewing",
          section: "Market Analysis",
          lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
        {
          id: "bob",
          name: "Bob Smith",
          email: "bob@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          status: "online",
          activity: "commenting",
          section: "Financial Projections",
          lastSeen: new Date(Date.now() - 30 * 1000), // 30 seconds ago
        },
      ]
      setFallbackUsers(demoUsers)
    } else {
      setFallbackUsers([])
    }
  }, [isInRoom, useOthers])

  const liveUsers: User[] = others.map((other: any) => ({
    id: other.connectionId,
    name: other.presence?.user?.name || "Anonymous",
    email: other.presence?.user?.email || "",
    avatar: other.presence?.user?.avatar,
    status: "online" as const,
    activity: other.presence?.isTyping ? "editing" : "viewing",
    section: other.presence?.selectedSection || "Unknown",
    lastSeen: new Date(),
  }))

  const users = useOthers ? liveUsers : fallbackUsers

  // Don't render if not in collaborative mode
  if (!isInRoom || users.length === 0) {
    return null
  }

  const getActivityIcon = (activity?: string) => {
    switch (activity) {
      case "editing":
        return <Edit3 className="w-3 h-3 text-blue-500" />
      case "commenting":
        return <MessageCircle className="w-3 h-3 text-green-500" />
      case "viewing":
      default:
        return <Eye className="w-3 h-3 text-gray-500" />
    }
  }

  const getActivityColor = (activity?: string) => {
    switch (activity) {
      case "editing":
        return "border-blue-500 bg-blue-500"
      case "commenting":
        return "border-green-500 bg-green-500"
      case "viewing":
      default:
        return "border-gray-500 bg-gray-500"
    }
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white/90">Live</span>
        </div>
        
        <div className="flex -space-x-2">
          {users.slice(0, 5).map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger>
                <div className="relative group">
                  <Avatar className="w-8 h-8 border-2 border-white/30 transition-transform group-hover:scale-110">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-xs bg-white/20 text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 border-white ${getActivityColor(user.activity)} flex items-center justify-center`}
                    >
                      {getActivityIcon(user.activity)}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="flex items-center gap-2 text-xs">
                    {getActivityIcon(user.activity)}
                    <span className="capitalize">{user.activity || "viewing"}</span>
                    {user.section && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{user.section}</span>
                      </>
                    )}
                  </div>
                  {user.lastSeen && (
                    <p className="text-xs text-muted-foreground">
                      Active {Math.round((Date.now() - user.lastSeen.getTime()) / 1000)}s ago
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        {users.length > 5 && (
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20 hover:bg-white/30 transition-colors">
                +{users.length - 5}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{users.length - 5} more users online</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <div className="flex items-center gap-1 text-xs text-white/80 ml-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>{users.length} online</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
