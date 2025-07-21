"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

import type { BusinessPlan } from "@/lib/airtable"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userEmail: string
  onPlanCreated: (plan: BusinessPlan) => void
}

export function CreatePlanDialog({ open, onOpenChange, userEmail, onPlanCreated }: CreatePlanDialogProps) {
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planName.trim()) {
      toast({ title: "Plan name is required", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: planName.trim(),
          description: description.trim(),
          ownerEmail: userEmail,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || "An unknown error occurred")
      }

      toast({ title: "Success!", description: `"${result.data.plan.planName}" has been created.` })
      onPlanCreated(result.data.plan)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create plan:", error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Could not create the plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPlanName("")
      setDescription("")
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a New Business Plan</DialogTitle>
          <DialogDescription>Give your new plan a name and an optional description to get started.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Q3 Marketing Strategy"
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of what this plan is about."
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Creating..." : "Create Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Re-export so it can be imported with either syntax
export default CreatePlanDialog
