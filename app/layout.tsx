import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { UserProvider } from "@/contexts/user-context"
import { SessionManager } from "@/components/session-manager"
import { UserStateDebug } from "@/components/user-state-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Business Plan Builder",
  description: "Collaborative business plan creation tool",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <UserProvider>
            {children}
            <SessionManager />
            <UserStateDebug />
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
