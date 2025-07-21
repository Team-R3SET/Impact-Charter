"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Shield, UserIcon } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface RoleSwitcherProps {
  className?: string
}

export function RoleSwitcher({ className }: RoleSwitcherProps) {
  const { currentUser, users, switchUser, isLoading } = useUser()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleUserSelect = async (userId: string) => {
    if (userId === currentUser?.id) {
      setIsOpen(false)
      return
    }

    setIsSwitching(true)
    try {
      await switchUser(userId)
    } catch (error) {
      console.error("Failed to switch user:", error)
      toast({
        title: "Failed to switch user",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSwitching(false)
      setIsOpen(false)
    }
  }

  if (isLoading || !currentUser) {
    return <Skeleton className={cn("h-10 w-full rounded-md", className)} />
  }

  const getRoleIcon = (role: string) => {
    return role.toLowerCase() === "admin" || role.toLowerCase() === "administrator" ? (
      <Shield className="h-3 w-3 text-red-500" />
    ) : (
      <UserIcon className="h-3 w-3 text-blue-500" />
    )
  }

  const getRoleBadge = (role: string) => {
    const isAdmin = role.toLowerCase() === "admin" || role.toLowerCase() === "administrator"
    return (
      <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs h-4">
        {isAdmin ? "Admin" : "User"}
      </Badge>
    )
  }

  return (
    <div className={cn("w-48", className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`flex w-full items-center gap-2 h-auto p-2 bg-transparent hover:bg-muted ${className}`}
            disabled={isSwitching}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
              <AvatarFallback className="text-xs">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate max-w-24">{currentUser.name}</span>
              {getRoleBadge(currentUser.role)}
            </div>
            <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ml-auto ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <span>Switch User</span>
            <Badge variant="outline" className="text-xs">
              Demo Mode
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {users.map((user) => {
            const isCurrentUser = currentUser.id === user.id
            const isAdmin = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "administrator"

            return (
              <DropdownMenuItem
                key={user.id}
                onClick={() => handleUserSelect(user.id)}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  isCurrentUser ? "bg-muted" : ""
                } ${isSwitching ? "opacity-50 pointer-events-none" : ""}`}
                disabled={isSwitching}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{user.name}</span>
                    {getRoleIcon(user.role)}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs h-4 w-fit mt-1">
                    {isAdmin ? "Administrator" : "Regular User"}
                  </Badge>
                </div>
                {isCurrentUser && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <div className="px-3 py-2 text-xs text-muted-foreground">
            This is a demo feature. In production, user switching would require proper authentication.
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
