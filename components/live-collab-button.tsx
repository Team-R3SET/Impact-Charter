"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, Play, Square } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface LiveCollabButtonProps {
  planId: string
}

export function LiveCollabButton({ planId }: LiveCollabButtonProps) {
  const [isCollaborative, setIsCollaborative] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if we're in collaborative mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setIsCollaborative(urlParams.get("collab") === "true")
  }, [])

  const handleToggleCollab = async () => {
    try {
      setIsConnecting(true)

      if (isCollaborative) {
        // Stop collaboration
        const url = new URL(window.location.href)
        url.searchParams.delete("collab")
        router.replace(url.pathname + url.search)

        toast({
          title: "Collaboration stopped",
          description: "You're now working in solo mode.",
        })
      } else {
        // Start collaboration
        const url = new URL(window.location.href)
        url.searchParams.set("collab", "true")
        router.replace(url.pathname + url.search)

        toast({
          title: "Live collaboration started!",
          description: "Share this URL with others to collaborate in real-time.",
        })
      }
    } catch (error) {
      console.error("Failed to toggle collaboration:", error)
      toast({
        title: "Error",
        description: "Failed to toggle collaboration mode.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggleCollab}
        disabled={isConnecting}
        variant={isCollaborative ? "destructive" : "default"}
        className={`transition-all duration-200 ${
          isCollaborative ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isConnecting ? (
          <>
            <Wifi className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : isCollaborative ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop Collaboration
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Start Live Collab
          </>
        )}
      </Button>

      {isCollaborative && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live
        </Badge>
      )}
    </div>
  )
}
