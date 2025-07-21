"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { AppHeader } from "@/components/app-header"
import { Check, X, Star, ArrowRight, CheckCircle, HelpCircle } from "lucide-react"
import { useUser } from "@/contexts/user-context"

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const { user } = useUser()

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small projects",
      monthlyPrice: 0,
      yearlyPrice: 0,
      popular: false,
      features: [
        { name: "1 Business Plan", included: true },
        { name: "Basic Templates", included: true },
        { name: "Export to PDF", included: true },
        { name: "Email Support", included: true },
        { name: "Real-time Collaboration", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "AI-Powered Insights", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Branding", included: false },
        { name: "Team Management", included: false },
      ],
    },
    {
      name: "Professional",
      description: "Most popular for growing businesses",
      monthlyPrice: 29,
      yearlyPrice: 24,
      popular: true,
      features: [
        { name: "Unlimited Business Plans", included: true },
        { name: "50+ Premium Templates", included: true },
        { name: "Export to PDF/Word/Excel", included: true },
        { name: "Priority Email Support", included: true },
        { name: "Real-time Collaboration", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "AI-Powered Insights", included: true },
        { name: "Priority Support", included: false },
        { name: "Custom Branding", included: false },
        { name: "Team Management", included: false },
      ],
    },
    {
      name: "Enterprise",
      description: "For large organizations and teams",
      monthlyPrice: 99,
      yearlyPrice: 82,
      popular: false,
      features: [
        { name: "Unlimited Everything", included: true },
        { name: "Custom Templates", included: true },
        { name: "All Export Formats", included: true },
        { name: "24/7 Phone & Email Support", included: true },
        { name: "Real-time Collaboration", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "AI-Powered Insights", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Branding", included: true },
        { name: "Team Management", included: true },
      ],
    },
  ]

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Startup Founder",
      content:
        "The Professional plan gave us everything we needed to secure funding. The collaboration features were essential.",
      rating: 5,
      plan: "Professional",
    },
    {
      name: "Maria Garcia",
      role: "Business Consultant",
      content: "Enterprise features help me manage multiple client projects efficiently. Worth every penny.",
      rating: 5,
      plan: "Enterprise",
    },
    {
      name: "David Kim",
      role: "Solo Entrepreneur",
      content: "Started with the free plan and upgraded as my business grew. Perfect progression.",
      rating: 5,
      plan: "Starter → Professional",
    },
  ]

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer:
        "Your data remains accessible for 30 days after cancellation. You can export all your business plans during this period.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.",
    },
    {
      question: "Is there a setup fee?",
      answer: "No setup fees, ever. You only pay the monthly or yearly subscription fee.",
    },
    {
      question: "Can I get a custom plan for my organization?",
      answer: "Yes, we offer custom enterprise solutions. Contact our sales team to discuss your specific needs.",
    },
  ]

  const getPrice = (plan: (typeof plans)[0]) => {
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice
  }

  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return 0
    return Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice * 12) / (plan.monthlyPrice * 12)) * 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your business needs. Start free and scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm ${!isYearly ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-blue-600" />
            <span className={`text-sm ${isYearly ? "font-semibold" : "text-muted-foreground"}`}>Yearly</span>
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
              Save up to 17%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? "ring-2 ring-blue-600 shadow-xl scale-105" : "shadow-lg"} transition-all duration-300 hover:shadow-xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-base mt-2">{plan.description}</CardDescription>

                  <div className="mt-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${getPrice(plan)}</span>
                      <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                    </div>

                    {isYearly && plan.monthlyPrice > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="line-through">${plan.monthlyPrice * 12}/year</span>
                        <span className="text-green-600 ml-2">Save {getSavings(plan)}%</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter className="pt-8">
                  <Button
                    className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href={user ? "/plans" : "/register"}>
                      {plan.monthlyPrice === 0 ? "Get Started Free" : "Start Free Trial"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Compare all features</h2>
            <p className="text-xl text-muted-foreground">See exactly what's included in each plan</p>
          </div>

          <div className="max-w-6xl mx-auto overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-6 font-semibold">Features</th>
                  {plans.map((plan, index) => (
                    <th key={index} className="text-center p-6 font-semibold">
                      {plan.name}
                      {plan.popular && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Popular
                        </Badge>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans[0].features.map((_, featureIndex) => (
                  <tr key={featureIndex} className="border-b hover:bg-muted/20">
                    <td className="p-6 font-medium">{plans[0].features[featureIndex].name}</td>
                    {plans.map((plan, planIndex) => (
                      <td key={planIndex} className="p-6 text-center">
                        {plan.features[featureIndex].included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What our customers say</h2>
            <p className="text-xl text-muted-foreground">Real feedback from businesses using our platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.plan}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-xl text-muted-foreground">Everything you need to know about our pricing</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of successful entrepreneurs who trust our platform to build their business plans.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href={user ? "/plans" : "/register"}>
                {user ? "Create New Plan" : "Start Free Trial"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              30-day money back guarantee
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
