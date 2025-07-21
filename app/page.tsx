"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { getDemoUsers } from "@/lib/user-management"
import { FileText, Users, BarChart3, Shield, Zap, Globe, CheckCircle, ArrowRight } from "lucide-react"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const demoUsers = getDemoUsers()
  const [currentUser, setCurrentUser] = useState<User>(demoUsers[1]) // Start with regular user

  const isAdmin = currentUser.role === "administrator"

  const features = [
    {
      icon: FileText,
      title: "Business Plan Creation",
      description: "Create comprehensive business plans with guided templates and real-time collaboration.",
      available: true,
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team in real-time with live editing and presence indicators.",
      available: true,
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor completion status and track progress across all sections of your business plan.",
      available: true,
    },
    {
      icon: Shield,
      title: "Admin Dashboard",
      description: "Access advanced administration features, user management, and system monitoring.",
      available: isAdmin,
      adminOnly: true,
    },
    {
      icon: Zap,
      title: "API Integration",
      description: "Seamless integration with Airtable for data storage and external system connectivity.",
      available: isAdmin,
      adminOnly: true,
    },
    {
      icon: Globe,
      title: "Multi-tenant Support",
      description: "Support for multiple organizations with role-based access control and permissions.",
      available: isAdmin,
      adminOnly: true,
    },
  ]

  const handleUserChange = (user: User) => {
    setCurrentUser(user)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AppHeader currentUser={currentUser} onUserChange={handleUserChange} />

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-sm">
              {isAdmin ? "Administrator View" : "User View"}
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">Business Plan Builder</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Create, collaborate, and manage comprehensive business plans with real-time editing, progress tracking, and
            powerful administrative tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-3">
              <Link href="/plans">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            {isAdmin && (
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3 bg-transparent">
                <Link href="/admin">
                  <Shield className="mr-2 w-5 h-5" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Role-based Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className={`transition-all duration-200 hover:shadow-lg ${
                  !feature.available ? "opacity-50 bg-gray-50 dark:bg-gray-800/50" : "hover:scale-105"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        feature.available
                          ? feature.adminOnly
                            ? "bg-red-100 dark:bg-red-900/20"
                            : "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          feature.available
                            ? feature.adminOnly
                              ? "text-red-600 dark:text-red-400"
                              : "text-blue-600 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    {feature.available && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {feature.adminOnly && (
                      <Badge variant="destructive" className="text-xs">
                        Admin Only
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={feature.available ? "" : "text-gray-500"}>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={feature.available ? "" : "text-gray-400"}>
                    {feature.description}
                  </CardDescription>
                  {!feature.available && feature.adminOnly && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                      Switch to Administrator role to access this feature
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Role Information */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <Shield className="w-5 h-5 text-red-600" />
                  Administrator Access
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 text-blue-600" />
                  Regular User Access
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Current Permissions:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Create and edit business plans
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Real-time collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Progress tracking
                  </li>
                  {isAdmin && (
                    <>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        User management and administration
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        System logs and error monitoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Airtable integration management
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use the role switcher in the header to toggle between Administrator and Regular User views to see how
                  the interface adapts to different permission levels.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
