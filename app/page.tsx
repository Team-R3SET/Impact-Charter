"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Users,
  BarChart3,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time. See changes instantly and collaborate seamlessly.",
    badge: "Live Sync",
  },
  {
    icon: FileText,
    title: "Professional Templates",
    description: "Choose from industry-specific templates designed by business experts.",
    badge: "Expert Designed",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track progress, analyze performance, and make data-driven decisions.",
    badge: "Insights",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with encryption, compliance, and audit trails.",
    badge: "Secure",
  },
  {
    icon: Zap,
    title: "AI-Powered Assistance",
    description: "Get intelligent suggestions and automated content generation.",
    badge: "AI Enhanced",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Access your plans anywhere, anytime, on any device.",
    badge: "Cloud Based",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechStart Inc.",
    content:
      "This platform transformed how we approach business planning. The collaboration features are game-changing.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Michael Chen",
    role: "Business Consultant",
    content:
      "I recommend this to all my clients. The templates are professional and the analytics provide real insights.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Startup Founder",
    content:
      "Finally, a business planning tool that actually helps you succeed. The AI suggestions are incredibly helpful.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
]

const stats = [
  { number: "50,000+", label: "Business Plans Created" },
  { number: "98%", label: "Customer Satisfaction" },
  { number: "150+", label: "Countries Served" },
  { number: "24/7", label: "Expert Support" },
]

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubmitted(true)
      // Here you would typically send the email to your backend
      setTimeout(() => setIsSubmitted(false), 3000)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-16 pb-24">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Sparkles className="w-4 h-4 mr-2" />
            Trusted by 50,000+ entrepreneurs
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Build Your Business Plan
            <br />
            <span className="text-gray-900">That Actually Works</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create professional business plans with real-time collaboration, AI assistance, and expert templates. Turn
            your vision into a roadmap for success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6"
              asChild
            >
              <Link href="/plans">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 bg-transparent" asChild>
              <Link href="/pricing">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Award className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Succeed
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features you need to create, collaborate, and
              execute successful business plans.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Customer Success
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Loved by
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Entrepreneurs
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful entrepreneurs who trust us with their business planning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white hover:bg-white/30">
              <Clock className="w-4 h-4 mr-2" />
              Stay Updated
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Get Business Planning Tips
              <br />
              Delivered Weekly
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 25,000+ entrepreneurs getting actionable insights, templates, and strategies delivered to their inbox
              every week.
            </p>

            {!isSubmitted ? (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
                  required
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                >
                  Subscribe Free
                </Button>
              </form>
            ) : (
              <div className="bg-white/10 rounded-lg p-6 max-w-md mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-white font-semibold">Thank you for subscribing!</p>
                <p className="text-blue-200 text-sm">Check your email for confirmation.</p>
              </div>
            )}

            <p className="text-sm text-blue-200 mt-4">Free business planning guide included • Unsubscribe anytime</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Build Your
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Success Story?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of entrepreneurs who've turned their ideas into thriving businesses
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6"
                asChild
              >
                <Link href="/plans">
                  Start Building Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 bg-transparent" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                No setup fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
