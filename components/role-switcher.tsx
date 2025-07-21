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
import { ChevronDown, Shield } from "lucide-react"
import { getDemoUsers } from "@/lib/user-management"
import type { User as UserType } from "@/lib/user-types"

interface RoleSwitcherProps {
  currentUser?: UserType | null
  onUserChange?: (user: UserType) => void
  availableUsers?: UserType[]
}

export function RoleSwitcher({ currentUser, onUserChange, availableUsers }: RoleSwitcherProps) {
  const demoUsers = getDemoUsers()
  const users = availableUsers || demoUsers
  const activeUser = currentUser || users[0]

  const [isOpen, setIsOpen] = useState(false)

  const handleUserSelect = (user: UserType) => {
    if (onUserChange) {
      onUserChange(user)
    }
    setIsOpen(false)
  }

  if (!activeUser) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-auto p-2 bg-transparent">
          <Avatar className="h-6 w-6">
            <AvatarImage src={activeUser.avatar || "/placeholder.svg"} alt={activeUser.name} />
            <AvatarFallback className="text-xs">
              {activeUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{activeUser.name}</span>
            <Badge variant={activeUser.role === "administrator" ? "destructive" : "secondary"} className="text-xs h-4">
              {activeUser.role === "administrator" ? "Admin" : "User"}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleUserSelect(user)}
            className="flex items-center gap-3 p-3"
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
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name}</span>
                {user.role === "administrator" ? (
                  <Shield className="h-3 w-3 text-red-500" />
                ) : (
                  <span className="h-3 w-3 text-blue-500">U</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <Badge
                variant={user.role === "administrator" ? "destructive" : "secondary"}
                className="text-xs h-4 w-fit mt-1"
              >
                {user.role === "administrator" ? "Administrator" : "Regular User"}
              </Badge>
            </div>
            {activeUser.id === user.id && <div className="w-2 h-2 bg-green-500 rounded-full" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
