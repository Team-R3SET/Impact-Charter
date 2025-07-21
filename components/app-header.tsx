"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut } from "lucide-react"
import { ThemeSwitcher } from "./theme-switcher"
import { useUser } from "@/contexts/user-context"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { logout } from "@/app/auth/actions"

export function AppHeader() {
  const { user, profile } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Impact Charter</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/plans">My Plans</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden bg-transparent">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <span>Impact Charter</span>
              </Link>
              <Link href="/plans">My Plans</Link>
              <Link href="/pricing">Pricing</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeSwitcher />
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.name ?? "User"} />
                  <AvatarFallback>{profile?.name?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <form action={logout}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
