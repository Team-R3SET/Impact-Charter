import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from "@/components/app-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Plan Builder",
  description: "Create and collaborate on business plans in real-time",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Replace with real auth
  const currentUser = {
    name: "Demo User",
    email: "user@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user@example.com",
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <AppHeader currentUser={currentUser} />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
