"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { useUser } from "@/contexts/user-context"
import {
  FileText,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Clock,
  Globe,
  Sparkles,
  BarChart3,
  Target,
  Lightbulb,
  Award,
  Mail,
} from "lucide-react"
import type { User } from "@/lib/user-types"

export default function HomePage() {
  const { user, isAuthenticated, login } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleQuickDemo = async () => {
    setIsLoading(true)
    try {
      const demoUser: User = {
        id: "demo-user",
        name: "Demo User",
        email: "demo@example.com",
        role: "regular",
        company: "Demo Company",
        department: "Marketing",
        createdDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        isActive: true,
        avatar: "/placeholder-user.jpg",
      }

      login(demoUser)
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Demo login failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserChange = (newUser: User) => {
    // Handle user change if needed
  }

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Simulate newsletter signup
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubscribed(true)
    setEmail("")
  }

  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time. See live cursors, instant updates, and collaborate seamlessly.",
      highlight: "Live editing",
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-600" />,
      title: "Smart Templates",
      description: "Get started quickly with industry-specific templates designed by business experts.",
      highlight: "9+ templates",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: "Progress Tracking",
      description: "Monitor completion rates, track milestones, and stay on top of your business planning goals.",
      highlight: "Visual progress",
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      title: "Secure & Private",
      description: "Enterprise-grade security ensures your business plans and data remain completely private.",
      highlight: "Bank-level security",
    },
    {
      icon: <Globe className="w-6 h-6 text-indigo-600" />,
      title: "Export Anywhere",
      description: "Export to PDF, Word, or share via secure links. Your plans work everywhere you do.",
      highlight: "Multiple formats",
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Auto-Save",
      description: "Never lose your work. Everything is automatically saved as you type, with full version history.",
      highlight: "Never lose work",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      company: "TechFlow",
      content:
        "This platform helped us secure $2M in funding. The collaborative features made it easy to work with our advisors.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Marcus Rodriguez",
      role: "Business Consultant",
      company: "Growth Partners",
      content:
        "I use this with all my clients. The templates are comprehensive and the real-time collaboration is game-changing.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
    {
      name: "Emily Watson",
      role: "Restaurant Owner",
      company: "Bella Vista",
      content: "Created our expansion plan in just 2 weeks. The restaurant template had everything we needed.",
      rating: 5,
      avatar: "/placeholder-user.jpg",
    },
  ]

  const stats = [
    { number: "50,000+", label: "Business Plans Created" },
    { number: "98%", label: "User Satisfaction" },
    { number: "24/7", label: "Expert Support" },
    { number: "15min", label: "Average Setup Time" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
      <AppHeader currentUser={user} onUserChange={handleUserChange} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 50,000+ entrepreneurs
            </Badge>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Build Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Dream Business
                </span>
                <br />
                Plan Together
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                The only collaborative business planning platform you'll ever need. Create, collaborate, and succeed
                with real-time editing, expert templates, and powerful analytics.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    onClick={handleQuickDemo}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isLoading ? "Starting Demo..." : "Try Free Demo"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 bg-transparent"
                  >
                    <Link href="/plans">
                      Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Link href="/plans">
                      View My Plans <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="px-8 py-4 text-lg font-semibold border-2 bg-transparent"
                  >
                    <Link href="/profile">Manage Profile</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-70">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Setup in 2 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to
              <span className="text-blue-600"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              From idea to execution, our platform provides all the tools and guidance you need to create professional
              business plans that get results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.highlight}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              <Award className="w-4 h-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by
              <span className="text-blue-600"> Entrepreneurs</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of successful entrepreneurs who've built their dreams with our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <Lightbulb className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Business Planning Tips & Updates</h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  Join 25,000+ entrepreneurs receiving weekly insights, templates, and success stories delivered
                  straight to your inbox.
                </p>
              </div>

              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                    required
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Subscribe
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-green-200">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Thanks for subscribing!</span>
                </div>
              )}

              <p className="text-sm opacity-70 mt-4">No spam, unsubscribe anytime. Read our privacy policy.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gray-900 dark:bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Build Your
              <span className="text-blue-400"> Success Story?</span>
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of entrepreneurs who've turned their ideas into thriving businesses. Start your journey
              today with our free plan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg font-semibold">
                <Link href="/plans">
                  Start Building Now <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleQuickDemo}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg font-semibold bg-transparent"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-gray-400">
              <span>✓ Free forever plan</span>
              <span>✓ No setup fees</span>
              <span>✓ Cancel anytime</span>
              <span>✓ 24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-lg">PlanBuilder</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                The collaborative business planning platform trusted by entrepreneurs worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-blue-600">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-blue-600">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-blue-600">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="hover:text-blue-600">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/blog" className="hover:text-blue-600">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="hover:text-blue-600">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-blue-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-blue-600">
                    API Docs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-blue-600">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-blue-600">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-600">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-600">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 PlanBuilder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
