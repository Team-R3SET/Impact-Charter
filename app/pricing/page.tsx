"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Star, Users, Building, Crown, Zap, Shield, Headphones } from "lucide-react"
import Link from "next/link"

const pricingPlans = {
  monthly: [
    {
      name: "Starter",
      price: 0,
      description: "Perfect for individuals getting started with business planning",
      features: [
        { name: "1 Business Plan", included: true },
        { name: "Basic Templates", included: true },
        { name: "PDF Export", included: true },
        { name: "Community Support", included: true },
        { name: "Real-time Collaboration", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Branding", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
      icon: Users,
    },
    {
      name: "Professional",
      price: 29,
      description: "Ideal for entrepreneurs and small businesses",
      features: [
        { name: "Unlimited Business Plans", included: true },
        { name: "Premium Templates", included: true },
        { name: "PDF & Word Export", included: true },
        { name: "Real-time Collaboration", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Email Support", included: true },
        { name: "Custom Branding", included: false },
        { name: "API Access", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      icon: Building,
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For large teams and organizations",
      features: [
        { name: "Everything in Professional", included: true },
        { name: "Custom Branding", included: true },
        { name: "API Access", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Security", included: true },
        { name: "Team Management", included: true },
        { name: "Custom Integrations", included: true },
        { name: "Dedicated Account Manager", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      icon: Crown,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: 0,
      description: "Perfect for individuals getting started with business planning",
      features: [
        { name: "1 Business Plan", included: true },
        { name: "Basic Templates", included: true },
        { name: "PDF Export", included: true },
        { name: "Community Support", included: true },
        { name: "Real-time Collaboration", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Branding", included: false },
      ],
      cta: "Get Started Free",
      popular: false,
      icon: Users,
    },
    {
      name: "Professional",
      price: 290,
      originalPrice: 348,
      description: "Ideal for entrepreneurs and small businesses",
      features: [
        { name: "Unlimited Business Plans", included: true },
        { name: "Premium Templates", included: true },
        { name: "PDF & Word Export", included: true },
        { name: "Real-time Collaboration", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Email Support", included: true },
        { name: "Custom Branding", included: false },
        { name: "API Access", included: false },
      ],
      cta: "Start Free Trial",
      popular: true,
      icon: Building,
    },
    {
      name: "Enterprise",
      price: 990,
      originalPrice: 1188,
      description: "For large teams and organizations",
      features: [
        { name: "Everything in Professional", included: true },
        { name: "Custom Branding", included: true },
        { name: "API Access", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Security", included: true },
        { name: "Team Management", included: true },
        { name: "Custom Integrations", included: true },
        { name: "Dedicated Account Manager", included: true },
      ],
      cta: "Contact Sales",
      popular: false,
      icon: Crown,
    },
  ],
}

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Startup Founder",
    company: "TechVenture Inc.",
    content:
      "The Professional plan gave us everything we needed to create comprehensive business plans. The collaboration features are game-changing!",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Michael Chen",
    role: "Business Consultant",
    company: "Strategic Solutions",
    content:
      "I use this for all my clients. The templates are professional and the analytics help track progress effectively.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Operations Director",
    company: "Global Enterprises",
    content:
      "Enterprise plan is perfect for our large team. The custom branding and priority support are worth every penny.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
]

const faqs = [
  {
    question: "Can I change my plan at any time?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees.",
  },
  {
    question: "Do you offer discounts for nonprofits or students?",
    answer: "Yes, we offer 50% discounts for verified nonprofits and students. Contact us for details.",
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const currentPlans = pricingPlans[billingCycle]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          <Zap className="w-4 h-4 mr-2" />
          Simple, Transparent Pricing
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Start free and scale as you grow. All plans include our core features with no hidden fees.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <Tabs
            value={billingCycle}
            onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-white">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="data-[state=active]:bg-white">
                Yearly
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                  Save 17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {currentPlans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular ? "ring-2 ring-blue-500 shadow-xl scale-105" : "hover:shadow-lg"
                } ${selectedPlan === plan.name ? "ring-2 ring-indigo-500" : ""}`}
                onClick={() => setSelectedPlan(plan.name)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600 mt-2">{plan.description}</CardDescription>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-2">/{billingCycle === "monthly" ? "month" : "year"}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="line-through">${plan.originalPrice}</span>
                        <span className="text-green-600 ml-2 font-semibold">
                          Save ${plan.originalPrice - plan.price}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-900" : "text-gray-400"}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pb-6">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.name === "Enterprise" ? "/contact" : "/plans"}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Compare All Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Get a detailed breakdown of what's included in each plan</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center p-6 font-semibold text-gray-900">Starter</th>
                  <th className="text-center p-6 font-semibold text-gray-900 bg-blue-50">
                    Professional
                    <Badge className="ml-2 bg-blue-600">Popular</Badge>
                  </th>
                  <th className="text-center p-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: "Business Plans", starter: "1", professional: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Templates", starter: "Basic", professional: "Premium", enterprise: "Premium + Custom" },
                  { feature: "Export Options", starter: "PDF", professional: "PDF, Word", enterprise: "All Formats" },
                  { feature: "Collaboration", starter: false, professional: true, enterprise: true },
                  { feature: "Analytics", starter: false, professional: true, enterprise: "Advanced" },
                  { feature: "Support", starter: "Community", professional: "Email", enterprise: "Priority + Phone" },
                  { feature: "Custom Branding", starter: false, professional: false, enterprise: true },
                  { feature: "API Access", starter: false, professional: false, enterprise: true },
                  { feature: "Team Management", starter: false, professional: false, enterprise: true },
                  {
                    feature: "Security",
                    starter: "Standard",
                    professional: "Enhanced",
                    enterprise: "Enterprise-grade",
                  },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                    <td className="p-6 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{row.starter}</span>
                      )}
                    </td>
                    <td className="p-6 text-center bg-blue-50/50">
                      {typeof row.professional === "boolean" ? (
                        row.professional ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-900 font-medium">{row.professional}</span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-600">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their business planning
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white max-w-4xl mx-auto">
          <Shield className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join over 50,000 entrepreneurs who trust us with their business planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/plans">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/contact">
                <Headphones className="w-4 h-4 mr-2" />
                Talk to Sales
              </Link>
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">14-day free trial • No credit card required • Cancel anytime</p>
        </div>
      </div>
    </div>
  )
}
