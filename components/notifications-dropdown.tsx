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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Check, Edit, UserPlus, UserMinus, FileText } from "lucide-react"
import { useOthers, useEventListener, useBroadcastEvent } from "@/lib/liveblocks"

interface Notification {
  id: string
  type: "user_joined" | "user_left" | "section_changed" | "section_completed" | "user_typing"
  message: string
  user: {
    name: string
    email: string
    avatar: string
  }
  timestamp: Date
  sectionId?: string
  read: boolean
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const others = useOthers()
  const broadcast = useBroadcastEvent()

  // Listen for room events
  useEventListener(({ event }) => {
    if (event.type === "TEXT_CHANGE") {
      addNotification({
        type: "section_changed",
        message: `edited ${event.sectionId}`,
        user: {
          name: event.userId,
          email: event.userId,
          avatar: "/placeholder.svg",
        },
        sectionId: event.sectionId,
      })
    }
  })

  // Track user presence changes
  useEffect(() => {
    const currentUserIds = new Set(others.map((user) => user.id))
    const previousUserIds = new Set(notifications.filter((n) => n.type === "user_joined").map((n) => n.user.email))

    // Check for new users
    others.forEach((user) => {
      if (!previousUserIds.has(user.id)) {
        addNotification({
          type: "user_joined",
          message: "joined the session",
          user: {
            name: user.info?.name || "Anonymous",
            email: user.id,
            avatar: user.info?.avatar || "/placeholder.svg",
          },
        })
      }
    })
  }, [others])

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]) // Keep last 20
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "user_joined":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "user_left":
        return <UserMinus className="w-4 h-4 text-red-500" />
      case "section_changed":
        return <Edit className="w-4 h-4 text-blue-500" />
      case "section_completed":
        return <Check className="w-4 h-4 text-green-500" />
      case "user_typing":
        return <FileText className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4" />
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10 h-10 w-10">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-2 text-xs">
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-6 px-2 text-xs">
                Clear all
              </Button>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs">Activity will appear here when others join</p>
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
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={notification.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {notification.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{notification.user.name}</span>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.timestamp)}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
