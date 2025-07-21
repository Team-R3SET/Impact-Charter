"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppHeader } from "@/components/app-header"
import { FileText, Users, BarChart3, Zap, CheckCircle, ArrowRight, Sparkles } from "lucide-react"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User>({
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
  })

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user)
  }

  const features = [
    {
      icon: FileText,
      title: "Smart Templates",
      description: "Pre-built business plan templates with industry-specific guidance and best practices.",
    },
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time with live editing and commenting features.",
    },
    {
      icon: BarChart3,
      title: "Financial Modeling",
      description: "Built-in financial calculators and forecasting tools to create accurate projections.",
    },
    {
      icon: Zap,
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions and feedback to improve your business plan quality.",
    },
  ]

  const benefits = [
    "Professional business plan templates",
    "Real-time collaboration tools",
    "Financial modeling and forecasting",
    "Export to PDF and presentations",
    "Secure cloud storage",
    "24/7 customer support",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <AppHeader currentUser={currentUser} onUserSwitch={handleUserSwitch} />

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              New Features Available
            </Badge>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Build Your Business Plan
            <br />
            <span className="text-blue-600 dark:text-blue-400">With Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create professional business plans with our intuitive platform. Collaborate with your team, get AI-powered
            insights, and turn your vision into a comprehensive strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-3 text-lg" asChild>
              <Link href="/plans">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Current User Info */}
        <div className="mb-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Current User
              </CardTitle>
              <CardDescription>Demo mode - switch users to test different roles</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{currentUser.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
              <Badge variant={currentUser.role === "administrator" ? "default" : "secondary"}>
                {currentUser.role === "administrator" ? "Administrator" : "Regular User"}
              </Badge>
              {currentUser.role === "administrator" && (
                <p className="text-sm text-muted-foreground mt-2">You have access to admin features and logs</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything You Need to Succeed</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools and resources you need to create a winning business
              plan.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Our Platform?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="mb-6 opacity-90">
                Join thousands of entrepreneurs who have successfully launched their businesses with our platform.
              </p>
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/plans">
                  Create Your First Plan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Start Building Your Future Today</h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Transform your business idea into a comprehensive plan that investors and stakeholders will love.
              </p>
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg" asChild>
                <Link href="/plans">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
