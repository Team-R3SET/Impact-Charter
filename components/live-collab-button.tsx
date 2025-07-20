"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Wifi, WifiOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface LiveCollabButtonProps {
  planId: string
}

export function LiveCollabButton({ planId }: LiveCollabButtonProps) {
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Check current collaboration state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setIsCollaborative(urlParams.get("collab") === "true")
  }, [])

  const handleToggleCollaboration = async () => {
    if (isCollaborative) {
      // Disable collaboration
      setIsConnecting(true)
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete("collab")
        router.push(url.pathname + url.search)

        toast({
          title: "Collaboration disabled",
          description: "You're now working in solo mode.",
        })
      } catch (error) {
        console.error("Failed to disable collaboration:", error)
        toast({
          title: "Error",
          description: "Failed to disable collaboration.",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    } else {
      // Enable collaboration
      setIsConnecting(true)
      setConnectionError(null)

      try {
        // Simulate connection process
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const url = new URL(window.location.href)
        url.searchParams.set("collab", "true")
        router.push(url.pathname + url.search)

        toast({
          title: "Live collaboration started!",
          description: "You can now collaborate in real-time with others.",
        })
      } catch (error) {
        console.error("Failed to start collaboration:", error)
        setConnectionError("Failed to connect to collaboration server")
        toast({
          title: "Connection failed",
          description: "Unable to start live collaboration. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    }
  }

  const getButtonVariant = () => {
    if (connectionError) return "destructive"
    if (isCollaborative) return "default"
    return "outline"
  }

  const getButtonIcon = () => {
    if (isConnecting) return <Loader2 className="w-4 h-4 animate-spin" />
    if (connectionError) return <WifiOff className="w-4 h-4" />
    if (isCollaborative) return <Wifi className="w-4 h-4" />
    return <Users className="w-4 h-4" />
  }

  const getButtonText = () => {
    if (isConnecting) return isCollaborative ? "Disconnecting..." : "Connecting..."
    if (connectionError) return "Connection Failed"
    if (isCollaborative) return "End Collaboration"
    return "Start Live Collab"
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {isCollaborative && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>

            {/* Mock participant avatars */}
            <div className="flex -space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-6 h-6 ring-2 ring-background">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-xs">DU</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Demo User (You)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        <Button
          onClick={handleToggleCollaboration}
          disabled={isConnecting}
          variant={getButtonVariant()}
          className="flex items-center gap-2"
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>
      </div>
    </TooltipProvider>
  )
}
