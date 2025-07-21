"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Building2,
  ShoppingCart,
  Smartphone,
  Utensils,
  Heart,
  GraduationCap,
  Palette,
  Wrench,
  Loader2,
  FileText,
} from "lucide-react"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

const businessTemplates = [
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Software, apps, and technology solutions",
    icon: Smartphone,
    color: "bg-blue-500",
    sections: [
      "Executive Summary",
      "Market Analysis",
      "Product Development",
      "Technology Stack",
      "Go-to-Market Strategy",
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail and marketplace businesses",
    icon: ShoppingCart,
    color: "bg-green-500",
    sections: ["Executive Summary", "Market Analysis", "Product Catalog", "Supply Chain", "Digital Marketing"],
  },
  {
    id: "restaurant",
    name: "Restaurant",
    description: "Food service and hospitality businesses",
    icon: Utensils,
    color: "bg-orange-500",
    sections: ["Executive Summary", "Market Analysis", "Menu & Pricing", "Location Strategy", "Operations Plan"],
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Medical services and health technology",
    icon: Heart,
    color: "bg-red-500",
    sections: [
      "Executive Summary",
      "Market Analysis",
      "Service Offerings",
      "Regulatory Compliance",
      "Patient Care Model",
    ],
  },
  {
    id: "education",
    name: "Education",
    description: "Educational services and EdTech platforms",
    icon: GraduationCap,
    color: "bg-purple-500",
    sections: ["Executive Summary", "Market Analysis", "Curriculum Design", "Learning Platform", "Student Acquisition"],
  },
  {
    id: "creative",
    name: "Creative Agency",
    description: "Design, marketing, and creative services",
    icon: Palette,
    color: "bg-pink-500",
    sections: ["Executive Summary", "Market Analysis", "Service Portfolio", "Creative Process", "Client Acquisition"],
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Professional services and expertise",
    icon: Building2,
    color: "bg-indigo-500",
    sections: ["Executive Summary", "Market Analysis", "Service Methodology", "Expertise Areas", "Client Engagement"],
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Production and industrial businesses",
    icon: Wrench,
    color: "bg-gray-500",
    sections: ["Executive Summary", "Market Analysis", "Production Process", "Supply Chain", "Quality Control"],
  },
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch with standard sections",
    icon: FileText,
    color: "bg-slate-500",
    sections: ["Executive Summary", "Market Analysis", "Business Model", "Marketing Strategy", "Financial Projections"],
  },
]

export function CreatePlanDialog({ open, onOpenChange, userEmail }: CreatePlanDialogProps) {
  const [step, setStep] = useState<"template" | "details">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof businessTemplates)[0] | null>(null)
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleTemplateSelect = (template: (typeof businessTemplates)[0]) => {
    setSelectedTemplate(template)
    setPlanName(template.name === "Blank Template" ? "" : `My ${template.name} Business`)
    setStep("details")
  }

  const handleBack = () => {
    setStep("template")
    setSelectedTemplate(null)
  }

  const handleCreate = async () => {
    if (!selectedTemplate || !planName.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planName.trim(),
          ownerEmail: userEmail,
          template: selectedTemplate.id,
          description: description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create business plan")
      }

      const newPlan = await response.json()

      toast({
        title: "Business plan created!",
        description: `"${planName}" has been created successfully.`,
      })

      // Reset form
      setStep("template")
      setSelectedTemplate(null)
      setPlanName("")
      setDescription("")
      onOpenChange(false)

      // Navigate to the new plan
      router.push(`/plan/${newPlan.id}?name=${encodeURIComponent(planName)}`)
    } catch (error) {
      console.error("Failed to create plan:", error)
      toast({
        title: "Failed to create plan",
        description: "There was an error creating your business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setStep("template")
      setSelectedTemplate(null)
      setPlanName("")
      setDescription("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === "template" ? (
          <>
            <DialogHeader>
              <DialogTitle>Choose a Business Plan Template</DialogTitle>
              <DialogDescription>
                Select a template that best matches your business type. You can customize it later.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {businessTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${template.color} text-white`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{template.name}</CardTitle>
                          <CardDescription className="text-xs">{template.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Includes sections:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.sections.slice(0, 3).map((section) => (
                            <Badge key={section} variant="secondary" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                          {template.sections.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.sections.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create Your Business Plan</DialogTitle>
              <DialogDescription>
                Customize your {selectedTemplate?.name} business plan with your details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Business Plan Name *</Label>
                <Input
                  id="planName"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter your business plan name"
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your business plan"
                  rows={3}
                  disabled={isCreating}
                />
              </div>

              {selectedTemplate && (
                <div className="space-y-2">
                  <Label>Template Sections</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.sections.map((section) => (
                      <Badge key={section} variant="outline">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleBack} disabled={isCreating}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!planName.trim() || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Business Plan"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
