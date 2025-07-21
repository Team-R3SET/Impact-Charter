"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FileText, Sparkles, Building, Rocket, Target } from "lucide-react"

interface CreatePlanDialogProps {
  isOpen: boolean
  onClose: () => void
}

const PLAN_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Plan",
    description: "Start from scratch with a completely customizable plan",
    icon: FileText,
    color: "text-gray-500",
  },
  {
    id: "startup",
    name: "Tech Startup",
    description: "Perfect for technology startups and SaaS businesses",
    icon: Rocket,
    color: "text-blue-500",
  },
  {
    id: "restaurant",
    name: "Restaurant & Food Service",
    description: "Tailored for restaurants, cafes, and food businesses",
    icon: Building,
    color: "text-orange-500",
  },
  {
    id: "ecommerce",
    name: "E-commerce Business",
    description: "Designed for online retail and marketplace businesses",
    icon: Target,
    color: "text-green-500",
  },
]

export function CreatePlanDialog({ isOpen, onClose }: CreatePlanDialogProps) {
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [template, setTemplate] = useState("blank")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCreate = async () => {
    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a plan name",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: planName.trim(),
          ownerEmail: "user@example.com", // TODO: Replace with real auth
          description: description.trim(),
          template,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create plan")
      }

      const { plan } = await response.json()

      toast({
        title: "Success!",
        description: "Your business plan has been created successfully.",
      })

      onClose()
      router.push(`/plan/${plan.id}?name=${encodeURIComponent(plan.planName)}`)
    } catch (error) {
      console.error("Failed to create plan:", error)
      toast({
        title: "Error",
        description: "Failed to create business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPlanName("")
      setDescription("")
      setTemplate("blank")
      onClose()
    }
  }

  const selectedTemplate = PLAN_TEMPLATES.find((t) => t.id === template)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Create New Business Plan
          </DialogTitle>
          <DialogDescription>Choose a template and give your business plan a name to get started.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Plan Name */}
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Plan Name *</Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., My Tech Startup Plan"
              disabled={isCreating}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your business plan..."
              disabled={isCreating}
              rows={3}
            />
          </div>

          {/* Template Selection */}
          <div className="grid gap-2">
            <Label htmlFor="template">Choose Template</Label>
            <Select value={template} onValueChange={setTemplate} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_TEMPLATES.map((tmpl) => (
                  <SelectItem key={tmpl.id} value={tmpl.id}>
                    <div className="flex items-center gap-2">
                      <tmpl.icon className={`w-4 h-4 ${tmpl.color}`} />
                      <span>{tmpl.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !planName.trim()}>
            {isCreating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Create Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
