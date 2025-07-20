"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, WifiOff, Loader2, Play, Square } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface LiveCollabButtonProps {
  planId: string
  planName: string
  currentUser: {
    name: string
    email: string
    avatar: string
  }
}

type CollabState = "inactive" | "connecting" | "connected" | "error"

export function LiveCollabButton({ planId, planName, currentUser }: LiveCollabButtonProps) {
  const [collabState, setCollabState] = useState<CollabState>("inactive")
  const [participants, setParticipants] = useState<Array<{ name: string; email: string; avatar: string }>>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check if collaboration is already active from URL params
  useEffect(() => {
    const isCollabActive = searchParams.get("collab") === "true"
    if (isCollabActive) {
      setCollabState("connected")
      // Simulate some participants for demo
      setParticipants([
        currentUser,
        {
          name: "Alice Johnson",
          email: "alice@example.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        },
      ])
    }
  }, [searchParams, currentUser])

  const handleCollabToggle = async () => {
    if (collabState === "connected") {
      // Stop collaboration
      setCollabState("inactive")
      setParticipants([])

      // Remove collab param from URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete("collab")
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname
      router.replace(newUrl)

      toast({
        title: "Collaboration Ended",
        description: "You've left the collaborative session.",
        duration: 3000,
      })
      return
    }

    // Start collaboration
    setIsInitializing(true)
    setCollabState("connecting")

    try {
      // Simulate room initialization
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add collab param to URL
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.set("collab", "true")
      router.replace(`${window.location.pathname}?${newSearchParams.toString()}`)

      setCollabState("connected")
      setParticipants([currentUser])

      toast({
        title: "Live Collaboration Started! 🚀",
        description: `"${planName}" is now ready for real-time collaboration. Share this URL with your team.`,
        duration: 5000,
      })

      // Simulate another user joining after a delay
      setTimeout(() => {
        setParticipants((prev) => [
          ...prev,
          {
            name: "Alice Johnson",
            email: "alice@example.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          },
        ])

        toast({
          title: "Alice Johnson joined",
          description: "A new collaborator has joined the session.",
          duration: 3000,
        })
      }, 3000)
    } catch (error) {
      console.error("Failed to initialize collaboration:", error)
      setCollabState("error")

      toast({
        title: "Connection Failed",
        description: "Unable to start collaboration. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const getButtonConfig = () => {
    switch (collabState) {
      case "connecting":
        return {
          text: "Connecting...",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        }
      case "connected":
        return {
          text: "End Collaboration",
          icon: <Square className="w-4 h-4" />,
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        }
      case "error":
        return {
          text: "Retry Connection",
          icon: <WifiOff className="w-4 h-4" />,
          variant: "destructive" as const,
          className: "",
        }
      default:
        return {
          text: "Start Live Collab",
          icon: <Play className="w-4 h-4" />,
          variant: "default" as const,
          className: "bg-blue-600 hover:bg-blue-700 text-white shadow-md",
        }
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        {/* Participants Display */}
        {participants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {participants.slice(0, 3).map((participant, index) => (
                <Tooltip key={participant.email}>
                  <TooltipTrigger>
                    <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback className="text-xs">
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{participant.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {participants.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{participants.length - 3}
              </Badge>
            )}

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  collabState === "connected"
                    ? "bg-green-500"
                    : collabState === "connecting"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-600">{participants.length} active</span>
            </div>
          </div>
        )}

        {/* Main Collaboration Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleCollabToggle}
              disabled={isInitializing}
              variant={buttonConfig.variant}
              className={`gap-2 font-medium px-4 py-2 ${buttonConfig.className}`}
              size="sm"
            >
              {buttonConfig.icon}
              {buttonConfig.text}
              {collabState === "connected" && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                  <Users className="w-3 h-3 mr-1" />
                  {participants.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-medium">
                {collabState === "inactive" && "Start real-time collaboration"}
                {collabState === "connecting" && "Initializing collaboration room..."}
                {collabState === "connected" && `${participants.length} people collaborating`}
                {collabState === "error" && "Connection failed - click to retry"}
              </p>
              {collabState === "connected" && (
                <p className="text-xs text-gray-400 mt-1">Share this URL to invite others</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
