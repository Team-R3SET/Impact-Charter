"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AppHeader } from "@/components/app-header"
import { OnboardingModal } from "@/components/onboarding-modal"
import { ArrowRight, CheckCircle, Users, Zap, Shield, Globe, Star, Sparkles, Target, BarChart3, Play, BookOpen, Settings, Database } from 'lucide-react'
import { useUser } from "@/contexts/user-context"

export default function HomePage() {
  const { user } = useUser()
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribed(true)
    setEmail("")
    setTimeout(() => setIsSubscribed(false), 3000)
  }

  const handleGetStarted = () => {
    if (user) {
      window.location.href = "/plans"
    } else {
      setShowOnboarding(true)
    }
  }

  const features = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, see changes instantly, and never lose progress.",
      badge: "Most Popular",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Insights",
      description: "Get intelligent suggestions and market analysis to strengthen your business plan.",
      badge: "New",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and security measures to protect your sensitive business data.",
      badge: "Secure",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Templates",
      description: "Access industry-specific templates used by successful businesses worldwide.",
      badge: "50+ Templates",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track progress, analyze performance, and make data-driven decisions.",
      badge: "Pro Feature",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Goal Tracking",
      description: "Set milestones, track achievements, and stay focused on your business objectives.",
      badge: "Essential",
      gradient: "from-teal-500 to-cyan-500",
    },
  ]

  const processSteps = [
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: "Choose Your Template",
      description: "Select from 50+ industry-specific templates or start from scratch",
      step: "01"
    },
    {
      icon: <Settings className="w-12 h-12" />,
      title: "Customize & Collaborate",
      description: "Work with your team in real-time using our collaborative editor",
      step: "02"
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Connect Your Data",
      description: "Integrate with Airtable for advanced data management and analytics",
      step: "03"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Launch & Track",
      description: "Execute your plan and monitor progress with built-in analytics",
      step: "04"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechStart Inc.",
      content: "This platform transformed how we approach business planning. The collaboration features are game-changing.",
      rating: 5,
      avatar: "/placeholder.svg",
      company: "TechStart Inc."
    },
    {
      name: "Michael Chen",
      role: "Founder, GreenTech Solutions",
      content: "The AI insights helped us identify market opportunities we never considered. Highly recommended!",
      rating: 5,
      avatar: "/placeholder.svg",
      company: "GreenTech Solutions"
    },
    {
      name: "Emily Rodriguez",
      role: "Business Consultant",
      content: "I use this with all my clients. The templates are comprehensive and the interface is intuitive.",
      rating: 5,
      avatar: "/placeholder.svg",
      company: "Rodriguez Consulting"
    },
  ]

  const stats = [
    { number: "50,000+", label: "Business Plans Created", icon: <BookOpen className="w-6 h-6" /> },
    { number: "98%", label: "Customer Satisfaction", icon: <Star className="w-6 h-6" /> },
    { number: "150+", label: "Countries Served", icon: <Globe className="w-6 h-6" /> },
    { number: "24/7", label: "Expert Support", icon: <Shield className="w-6 h-6" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        </div>
        
        <div className="relative container mx-auto px-4 py-32 lg:py-40">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Trusted by 50,000+ entrepreneurs worldwide
              <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                New: AI Assistant
              </Badge>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
              Build Your{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Dream Business
              </span>{" "}
              <br />
              Plan in Minutes
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Create professional business plans with AI-powered insights, real-time collaboration, and industry-proven templates. 
              <span className="block mt-2 text-lg md:text-xl lg:text-2xl font-medium text-blue-600 dark:text-blue-400">
                Turn your vision into reality with guided onboarding.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {user ? "Go to Dashboard" : "Start Building Free"}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-xl px-12 py-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-gray-900 shadow-lg"
                asChild
              >
                <Link href="#demo" className="flex items-center">
                  <Play className="mr-3 w-6 h-6" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 text-base text-muted-foreground">
              <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Cancel anytime
              </div>
            </div>

            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/70 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-3 text-base font-medium text-gray-900 dark:text-gray-100">4.9/5</span>
                <span className="text-base text-muted-foreground">from 2,000+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900 border-y shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-base text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How it works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From idea to execution in four simple steps. Our guided process ensures you never miss a critical component.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative group">
                <Card className="h-full border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mb-6">
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl text-blue-600 dark:text-blue-400 inline-block">
                        {step.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-3">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-base leading-relaxed">{step.description}</CardDescription>
                  </CardContent>
                </Card>
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300 dark:from-blue-700 dark:to-indigo-700 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need to succeed</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful features designed to help entrepreneurs and businesses create winning strategies and achieve their goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Loved by entrepreneurs worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our customers have to say about their success stories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-8 leading-relaxed text-lg italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{testimonial.name}</div>
                      <div className="text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Stay ahead of the competition</h2>
          <p className="text-xl opacity-90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get weekly insights, business tips, and exclusive templates delivered to your inbox.
          </p>

          {isSubscribed ? (
            <div className="flex items-center justify-center gap-3 text-green-300 text-xl">
              <CheckCircle className="w-6 h-6" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70 text-lg py-6 backdrop-blur-sm"
              />
              <Button type="submit" variant="secondary" className="whitespace-nowrap text-lg py-6 px-8 bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Get Started
              </Button>
            </form>
          )}
        </div>
      </section>

      <section className="py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to build your success story?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of entrepreneurs who have turned their ideas into thriving businesses with our comprehensive platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              {user ? "Create New Plan" : "Start Your Free Trial"}
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button variant="outline" size="lg" className="text-xl px-12 py-8 bg-transparent border-2 hover:bg-muted/50" asChild>
              <Link href="/pricing">View Pricing Plans</Link>
            </Button>
          </div>

          <p className="text-base text-muted-foreground">
            No credit card required • 14-day free trial • Cancel anytime • Setup assistance included
          </p>
        </div>
      </section>

      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </div>
  )
}
