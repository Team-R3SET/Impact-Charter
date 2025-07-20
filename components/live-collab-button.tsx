"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Wifi, WifiOff, Loader2 } from "lucide-react"
import { useRoom, useOthers, useMyPresence } from "@/lib/liveblocks"
import { toast } from "@/hooks/use-toast"

interface LiveCollabButtonProps {
  planId: string
  planName: string
  currentUser: {
    name: string
    email: string
    avatar?: string
  }
}

type CollabState = "disconnected" | "connecting" | "connected" | "error"

export function LiveCollabButton({ planId, planName, currentUser }: LiveCollabButtonProps) {
  const [collabState, setCollabState] = useState<CollabState>("disconnected")
  const [showParticipants, setShowParticipants] = useState(false)

  // These hooks will only work inside a RoomProvider
  const room = useRoom()
  const others = useOthers()
  const myPresence = useMyPresence()

  // Update collab state based on room connection
  useEffect(() => {
    if (!room) {
      setCollabState("disconnected")
      return
    }

    const updateConnectionState = () => {
      const connectionState = room.getStatus()
      switch (connectionState) {
        case "initial":
        case "connecting":
          setCollabState("connecting")
          break
        case "open":
          setCollabState("connected")
          break
        case "unavailable":
        case "closed":
          setCollabState("error")
          break
        default:
          setCollabState("disconnected")
      }
    }

    // Initial state
    updateConnectionState()

    // Listen for connection changes
    const unsubscribe = room.subscribe("status", updateConnectionState)

    return () => {
      unsubscribe()
    }
  }, [room])

  // Show success toast when connected
  useEffect(() => {
    if (collabState === "connected" && room) {
      toast({
        title: "Live Collaboration Active",
        description: `Connected to "${planName}" - Real-time editing enabled`,
        duration: 3000,
      })
    }
  }, [collabState, planName, room])

  const handleCollabToggle = async () => {
    if (collabState === "connected") {
      // Disconnect from collaboration
      try {
        setCollabState("connecting")
        // In a real implementation, you might want to leave the room
        // For now, we'll just refresh the page to disconnect
        window.location.reload()
      } catch (error) {
        console.error("Error disconnecting from collaboration:", error)
        setCollabState("error")
        toast({
          title: "Disconnection Failed",
          description: "Unable to disconnect from collaboration session",
          variant: "destructive",
        })
      }
    } else {
      // Connect to collaboration
      try {
        setCollabState("connecting")

        // Initialize the room by redirecting to the plan page
        // This will trigger the PlanRoom component to wrap the page
        const currentUrl = new URL(window.location.href)
        const searchParams = new URLSearchParams(currentUrl.search)
        searchParams.set("collab", "true")

        const newUrl = `/plan/${planId}?${searchParams.toString()}`
        window.location.href = newUrl
      } catch (error) {
        console.error("Error initializing collaboration:", error)
        setCollabState("error")
        toast({
          title: "Connection Failed",
          description: "Unable to initialize collaboration session",
          variant: "destructive",
        })
      }
    }
  }

  const getButtonVariant = () => {
    switch (collabState) {
      case "connected":
        return "default"
      case "connecting":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getButtonIcon = () => {
    switch (collabState) {
      case "connected":
        return <Wifi className="w-4 h-4" />
      case "connecting":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "error":
        return <WifiOff className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getButtonText = () => {
    switch (collabState) {
      case "connected":
        return "Live Collab Active"
      case "connecting":
        return "Connecting..."
      case "error":
        return "Connection Error"
      default:
        return "Start Live Collab"
    }
  }

  const getStatusColor = () => {
    switch (collabState) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeParticipants = others.length + (collabState === "connected" ? 1 : 0)

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={getButtonVariant()}
              size="sm"
              onClick={handleCollabToggle}
              disabled={collabState === "connecting"}
              className="relative"
            >
              {getButtonIcon()}
              <span className="ml-2">{getButtonText()}</span>

              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor()}`} />

              {/* Participant count badge */}
              {collabState === "connected" && activeParticipants > 1 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeParticipants}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">
                {collabState === "connected"
                  ? "Disconnect from live collaboration"
                  : "Start real-time collaborative editing"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {collabState === "connected"
                  ? `${activeParticipants} participant${activeParticipants !== 1 ? "s" : ""} active`
                  : "Enable live co-editing with your team"}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Participants preview */}
        {collabState === "connected" && others.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {others.slice(0, 3).map((other, index) => (
                <Tooltip key={other.connectionId}>
                  <TooltipTrigger asChild>
                    <Avatar className="w-6 h-6 border-2 border-background">
                      <AvatarImage
                        src={other.presence?.user?.avatar || "/placeholder.svg"}
                        alt={other.presence?.user?.name || "User"}
                      />
                      <AvatarFallback className="text-xs">
                        {(other.presence?.user?.name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{other.presence?.user?.name || "Anonymous User"}</p>
                    <p className="text-xs text-muted-foreground">{other.presence?.user?.email || "No email"}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {others.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{others.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
