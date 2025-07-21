"use client"

import { useState } from "react"
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { UserCog, Shield, UserIcon, Check } from "lucide-react"
import type { User } from "@/lib/user-types"

interface RoleSwitcherProps {
  currentUser: User
  onUserChange: (user: User) => void
  availableUsers: User[]
}

export function RoleSwitcher({ currentUser, onUserChange, availableUsers }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUserSwitch = (user: User) => {
    onUserChange(user)
    setIsOpen(false)
  }

  const getRoleIcon = (role: string) => {
    return role === "administrator" ? Shield : UserIcon
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === "administrator" ? "destructive" : "secondary"
  }

  const getRoleColor = (role: string) => {
    return role === "administrator" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 px-3 gap-2">
                <UserCog className="w-4 h-4" />
                <Badge variant={getRoleBadgeVariant(currentUser.role)} className="text-xs">
                  {currentUser.role === "administrator" ? "Admin" : "User"}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Switch User Role</p>
                  <p className="text-xs text-muted-foreground">Demo mode - switch between user types</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableUsers.map((user) => {
                const Icon = getRoleIcon(user.role)
                const isActive = user.id === currentUser.id

                return (
                  <DropdownMenuItem key={user.id} onClick={() => handleUserSwitch(user)} className="cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-full ${user.role === "administrator" ? "bg-red-100 dark:bg-red-900/20" : "bg-blue-100 dark:bg-blue-900/20"}`}
                        >
                          <Icon className={`w-3 h-3 ${getRoleColor(user.role)}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.role === "administrator" ? "Administrator" : "Regular User"}
                          </span>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-green-600" />}
                    </div>
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Current: {currentUser.role === "administrator" ? "Full Access" : "Limited Access"}</span>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch user role (Demo mode)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
