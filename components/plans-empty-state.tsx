"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Lightbulb, Users, BarChart3, Zap, Building2, ShoppingCart, Smartphone } from "lucide-react"

interface PlansEmptyStateProps {
  onCreatePlan: () => void
}

export function PlansEmptyState({ onCreatePlan }: PlansEmptyStateProps) {
  const features = [
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time",
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor completion and stay on track",
    },
    {
      icon: Zap,
      title: "Smart Templates",
      description: "Get started quickly with industry templates",
    },
  ]

  const templates = [
    { name: "Tech Startup", icon: Smartphone, color: "bg-blue-500" },
    { name: "E-commerce", icon: ShoppingCart, color: "bg-green-500" },
    { name: "Consulting", icon: Building2, color: "bg-purple-500" },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      {/* Main Empty State */}
      <div className="space-y-4">
        <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Create Your First Business Plan</h2>
          <p className="text-muted-foreground max-w-md">
            Get started with our collaborative business plan builder. Choose from templates or start from scratch.
          </p>
        </div>
        <Button onClick={onCreatePlan} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create New Business Plan
        </Button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Start Templates */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">Popular Templates</span>
        </div>
        <div className="flex items-center gap-3 justify-center">
          {templates.map((template, index) => {
            const IconComponent = template.icon
            return (
              <Badge
                key={index}
                variant="outline"
                className="gap-2 py-2 px-3 cursor-pointer hover:bg-muted transition-colors"
                onClick={onCreatePlan}
              >
                <div className={`w-4 h-4 rounded ${template.color} flex items-center justify-center`}>
                  <IconComponent className="w-3 h-3 text-white" />
                </div>
                {template.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-muted/50 rounded-lg p-6 max-w-2xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Pro Tips
        </h3>
        <ul className="text-sm text-muted-foreground space-y-2 text-left">
          <li>• Start with a template that matches your industry</li>
          <li>• Invite team members to collaborate in real-time</li>
          <li>• Complete sections gradually and track your progress</li>
          <li>• Export your plan when ready for investors or partners</li>
        </ul>
      </div>
    </div>
  )
}
