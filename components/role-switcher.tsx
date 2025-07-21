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
import { Users, Check, Shield, User } from "lucide-react"
import type { User as UserType } from "@/lib/user-types"

interface RoleSwitcherProps {
  currentUser: UserType
  onUserChange: (user: UserType) => void
  availableUsers: UserType[]
}

export function RoleSwitcher({ currentUser, onUserChange, availableUsers }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleUserSwitch = (user: UserType) => {
    onUserChange(user)
    setIsOpen(false)
  }

  const getRoleColor = (role: string) => {
    return role === "administrator" ? "destructive" : "secondary"
  }

  const getRoleIcon = (role: string) => {
    return role === "administrator" ? Shield : User
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-10 w-10">
                <Users className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Switch User Role (Demo)
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role)
                const isActive = user.id === currentUser.id

                return (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserSwitch(user)}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          <Badge variant={getRoleColor(user.role)} className="text-xs">
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {user.role === "administrator" ? "Admin" : "User"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        {user.company && <p className="text-xs text-muted-foreground">{user.company}</p>}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-green-600" />}
                  </DropdownMenuItem>
                )
              })}
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
