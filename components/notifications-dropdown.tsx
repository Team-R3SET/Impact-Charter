"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, User, FileText, CheckCircle, Edit3 } from "lucide-react"

interface Notification {
  id: string
  type: "user_joined" | "user_left" | "section_edited" | "section_completed"
  message: string
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
  section?: string
  read: boolean
}

// Safe hook that checks for RoomProvider context
function useSafeLiveblocks() {
  const [isInRoom, setIsInRoom] = useState(false)
  const [others, setOthers] = useState<any[]>([])

  useEffect(() => {
    // Check if we're in a Liveblocks room context
    try {
      // This is a safe way to check if we're in a room without throwing
      const roomElement = document.querySelector("[data-liveblocks-room]")
      setIsInRoom(!!roomElement)
    } catch (error) {
      setIsInRoom(false)
    }
  }, [])

  return { isInRoom, others }
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { isInRoom } = useSafeLiveblocks()

  // Add some demo notifications for testing
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: "1",
        type: "user_joined",
        message: "Alice Johnson joined the collaboration",
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        user: { name: "Alice Johnson", avatar: "/placeholder.svg" },
        read: false,
      },
      {
        id: "2",
        type: "section_edited",
        message: "Executive Summary was updated",
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        section: "Executive Summary",
        read: false,
      },
      {
        id: "3",
        type: "section_completed",
        message: "Market Analysis marked as complete",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        section: "Market Analysis",
        read: true,
      },
    ]

    // Only show notifications if we're in a collaborative context
    if (isInRoom) {
      setNotifications(demoNotifications)
    } else {
      setNotifications([])
    }
  }, [isInRoom])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "user_joined":
      case "user_left":
        return <User className="w-4 h-4" />
      case "section_edited":
        return <Edit3 className="w-4 h-4" />
      case "section_completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "user_joined":
        return "text-green-600"
      case "user_left":
        return "text-red-600"
      case "section_edited":
        return "text-blue-600"
      case "section_completed":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  // Don't render if not in a collaborative context
  if (!isInRoom) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-10 w-10">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Collaboration Activity</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-xs mt-1">Collaboration activity will appear here</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{notification.message}</p>
                  {notification.section && (
                    <p className="text-xs text-muted-foreground mt-1">Section: {notification.section}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.timestamp)}</p>
                </div>
                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
