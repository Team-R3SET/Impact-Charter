"use client"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Users, Check, Shield, UserIcon } from "lucide-react"
import type { User } from "@/lib/user-types"
import { getDemoUsers } from "@/lib/user-management"

interface RoleSwitcherProps {
  currentUser?: User
  onUserChange?: (user: User) => void
  availableUsers?: User[]
}

export function RoleSwitcher({ currentUser, onUserChange, availableUsers }: RoleSwitcherProps) {
  const usersToShow = availableUsers && availableUsers.length > 0 ? availableUsers : getDemoUsers()

  // If `currentUser` wasn’t passed in, default to the first available user.
  const activeUser = currentUser ?? usersToShow[0]

  // Prevent runtime crashes if the parent forgot to pass `onUserChange`.
  const handleUserChange = onUserChange ?? (() => {})

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10">
                <Users className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Switch User Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {usersToShow.map((user) => (
                <DropdownMenuItem key={user.id} onClick={() => handleUserChange(user)} className="cursor-pointer p-3">
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.role === "administrator" ? (
                          <Badge variant="destructive" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <UserIcon className="w-3 h-3 mr-1" />
                            User
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.company}</p>
                    </div>
                    {activeUser?.id === user.id && <Check className="w-4 h-4 text-green-500" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch User Role (Demo)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
