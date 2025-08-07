"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, Store, Laptop, Utensils, Heart, Briefcase, Zap, Globe, Building } from 'lucide-react'
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
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
}

const businessTemplates = [
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Perfect for SaaS, mobile apps, and technology companies",
    icon: <Laptop className="h-6 w-6" />,
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "restaurant",
    name: "Restaurant & Food Service",
    description: "Tailored for restaurants, cafes, and food businesses",
    icon: <Utensils className="h-6 w-6" />,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Online retail, marketplace, and digital commerce",
    icon: <Store className="h-6 w-6" />,
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "healthcare",
    name: "Healthcare & Wellness",
    description: "Medical practices, wellness centers, and health services",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
  },
  {
    id: "consulting",
    name: "Consulting & Services",
    description: "Professional services, consulting, and B2B solutions",
    icon: <Briefcase className="h-6 w-6" />,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    description: "Production, manufacturing, and industrial businesses",
    icon: <Building className="h-6 w-6" />,
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  },
  {
    id: "energy",
    name: "Energy & Sustainability",
    description: "Renewable energy, green tech, and sustainable solutions",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    id: "nonprofit",
    name: "Non-Profit",
    description: "NGOs, charities, and social impact organizations",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300",
  },
  {
    id: "blank",
    name: "Blank Template",
    description: "Start from scratch with a customizable template",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
]

export function CreatePlanDialog({ open, onOpenChange, userEmail }: CreatePlanDialogProps) {
  const [step, setStep] = useState<"template" | "details">("template")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [planName, setPlanName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setStep("details")

    // Auto-generate a plan name based on template
    const template = businessTemplates.find((t) => t.id === templateId)
    if (template && template.id !== "blank") {
    } else {
      setPlanName("")
    }
  }

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your business plan.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: planName.trim(),
          ownerEmail: userEmail,
          status: "Draft",
          template: selectedTemplate,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create plan")
      }

      const newPlan = await response.json()

      // Check if Airtable worked and show appropriate message
      if (newPlan._airtableWorked) {
        toast({
          title: "Plan created successfully!",
          description: `"${planName}" has been created and saved to Airtable.`,
        })
      } else {
        toast({
          title: "Plan created (Local Only)",
          description: `"${planName}" was created but couldn't be saved to Airtable. ${newPlan._airtableError || 'Please check your Airtable configuration.'}`,
          variant: "destructive",
        })
      }

      // Close dialog and reset state
      onOpenChange(false)
      setStep("template")
      setSelectedTemplate("")
      setPlanName("")

      // Add a small delay before navigation to ensure the plan is saved
      setTimeout(() => {
        // Navigate to the new plan
        router.push(`/plan/${newPlan.id}`)
      }, 500)
    } catch (error) {
      console.error("Error creating plan:", error)
      toast({
        title: "Error creating plan",
        description: "There was an error creating your business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    setStep("template")
    setSelectedTemplate("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setStep("template")
    setSelectedTemplate("")
    setPlanName("")
  }

  const selectedTemplateData = businessTemplates.find((t) => t.id === selectedTemplate)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        {step === "template" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Business Plan
              </DialogTitle>
              <DialogDescription>
                Choose a template that best matches your business type to get started with pre-built sections and
                guidance.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {businessTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mx-auto`}>
                      {template.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTemplateData && (
                  <div className={`w-8 h-8 rounded-lg ${selectedTemplateData.color} flex items-center justify-center`}>
                    {selectedTemplateData.icon}
                  </div>
                )}
              </DialogTitle>
              <DialogDescription>Customize your business plan with a name and initial settings.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Input
                  id="planName"
                  placeholder="Enter your business charter name..."
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="text-lg"
                />
              </div>

              {selectedTemplateData && selectedTemplateData.id !== "blank" && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">Template Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Pre-built sections tailored for {selectedTemplateData.name.toLowerCase()}</li>
                    <li>• Industry-specific guidance and examples</li>
                    <li>• Financial templates and projections</li>
                    <li>• Market analysis frameworks</li>
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back to Templates
              </Button>
              <Button onClick={handleCreatePlan} disabled={isCreating || !planName.trim()} className="gap-2">
                {isCreating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
