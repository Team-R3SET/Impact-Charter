"use client"

import { FileText, Plus, Lightbulb, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PlansEmptyStateProps {
  onCreatePlan?: () => void
}

export function PlansEmptyState({ onCreatePlan }: PlansEmptyStateProps) {
  const templates = [
    {
      name: "Tech Startup",
      description: "Perfect for technology companies and SaaS businesses",
      icon: "💻",
    },
    {
      name: "Restaurant",
      description: "Tailored for food service and hospitality businesses",
      icon: "🍽️",
    },
    {
      name: "E-commerce",
      description: "Designed for online retail and marketplace businesses",
      icon: "🛒",
    },
  ]

  const features = [
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time",
    },
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: "Goal Tracking",
      description: "Set and monitor your business objectives",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: "Smart Templates",
      description: "Industry-specific templates to get you started",
    },
  ]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Icon and Title */}
        <div className="space-y-4">
          <div className="h-24 w-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Create Your First Business Plan</h2>
            <p className="text-muted-foreground text-lg">
              Start building your business plan with our collaborative tools and expert templates
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-dashed">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Templates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                onClick={onCreatePlan}
              >
                <span className="text-2xl">{template.icon}</span>
                <div className="text-center">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Primary Action */}
        <div className="space-y-4">
          <Button size="lg" onClick={onCreatePlan} className="gap-2">
            <Plus className="h-5 w-5" />
            Create Your First Plan
          </Button>
          <p className="text-sm text-muted-foreground">Get started in minutes with our guided setup process</p>
        </div>

        {/* Pro Tips */}
        <div className="bg-muted/50 rounded-lg p-6 text-left space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Pro Tips
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Start with a template that matches your industry</li>
            <li>• Invite team members to collaborate in real-time</li>
            <li>• Use the section navigator to track your progress</li>
            <li>• Export your plan to PDF when ready to share</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
