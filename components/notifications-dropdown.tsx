"use client"

import { useState, useEffect } from "react"
import { useRoom, useOthers, useEventListener, useBroadcastEvent } from "@liveblocks/react/suspense"
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
import { formatDistanceToNow } from "date-fns"

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

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const others = useOthers()
  const broadcast = useBroadcastEvent()
  let room

  try {
    room = useRoom()
  } catch {
    // Not inside a RoomProvider, don't render anything
    return null
  }

  if (!room) {
    return null
  }

  // Listen for custom events
  useEventListener(({ event, user }) => {
    const newNotification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type: event.type as any,
      message: event.message,
      timestamp: new Date(),
      user: user.info,
      section: event.section,
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]) // Keep last 50
  })

  // Track user presence changes
  useEffect(() => {
    const currentUserIds = new Set(others.map((user) => user.connectionId))

    // This is a simplified presence tracking - in a real app you'd want more sophisticated logic
    others.forEach((user) => {
      if (user.presence?.status === "online") {
        // User is online - could add join notification logic here
      }
    })
  }, [others])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">No notifications yet</div>
        ) : (
          <ScrollArea className="h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
                }}
              >
                <div className={`mt-0.5 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{notification.message}</p>
                  {notification.section && (
                    <p className="text-xs text-muted-foreground mt-1">Section: {notification.section}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                  </p>
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
