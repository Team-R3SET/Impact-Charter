"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Users, Check } from "lucide-react"
import type { User } from "@/lib/user-types"

interface UserSwitcherProps {
  currentUser: User
  onUserSwitch: (user: User) => void
}

export function UserSwitcher({ currentUser, onUserSwitch }: UserSwitcherProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real app, this would be an API call
        const users: User[] = [
          {
            id: "admin-1",
            name: "Admin User",
            email: "admin@example.com",
            role: "administrator",
            company: "Business Plan Co",
            department: "IT Administration",
            createdDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            isActive: true,
            avatar: "/placeholder.svg?height=40&width=40&text=AD",
          },
          {
            id: "user-1",
            name: "John Doe",
            email: "john@example.com",
            role: "regular",
            company: "Startup Inc",
            department: "Business Development",
            createdDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            isActive: true,
            avatar: "/placeholder.svg?height=40&width=40&text=JD",
          },
          {
            id: "user-2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "regular",
            company: "Innovation Corp",
            department: "Strategy",
            createdDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
            isActive: true,
            avatar: "/placeholder.svg?height=40&width=40&text=JS",
          },
        ]
        setAvailableUsers(users)
      } catch (error) {
        console.error("Failed to fetch users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserSwitch = (user: User) => {
    onUserSwitch(user)
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10">
                <Users className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch User (Demo)</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Switch User</p>
              <p className="text-xs leading-none text-muted-foreground">Demo mode - switch between user roles</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isLoading ? (
            <DropdownMenuItem disabled>Loading users...</DropdownMenuItem>
          ) : (
            availableUsers.map((user) => (
              <DropdownMenuItem
                key={user.id}
                onClick={() => handleUserSwitch(user)}
                className="flex items-center gap-3 p-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {user.role === "administrator" && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                    {currentUser.id === user.id && <Check className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.company && <p className="text-xs text-muted-foreground truncate">{user.company}</p>}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
