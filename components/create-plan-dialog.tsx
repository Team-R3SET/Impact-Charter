"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerId: string
  onPlanCreated: () => void
}

export function CreatePlanDialog({ open, onOpenChange, onPlanCreated }: CreatePlanDialogProps) {
  const [planName, setPlanName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!planName.trim()) {
      toast({
        title: "Plan name is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/business-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      })

      if (!response.ok) {
        throw new Error("Failed to create plan")
      }

      toast({
        title: "Plan Created",
        description: `Your new plan "${planName}" has been created.`,
      })
      onPlanCreated()
      onOpenChange(false)
      setPlanName("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create the business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Business Plan</DialogTitle>
          <DialogDescription>Give your new business plan a name to get started.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="planName" className="text-right">
              Plan Name
            </Label>
            <Input
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., My Awesome Startup"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
