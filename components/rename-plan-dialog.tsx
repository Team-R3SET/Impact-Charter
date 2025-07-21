"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit3 } from "lucide-react"

interface RenamePlanDialogProps {
  isOpen: boolean
  onClose: () => void
  planId: string
  currentName: string
  onSuccess: (newName: string) => void
}

export function RenamePlanDialog({ isOpen, onClose, planId, currentName, onSuccess }: RenamePlanDialogProps) {
  const [newName, setNewName] = useState(currentName)
  const [isRenaming, setIsRenaming] = useState(false)
  const { toast } = useToast()

  const handleRename = async () => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Plan name cannot be empty",
        variant: "destructive",
      })
      return
    }

    if (newName.trim() === currentName) {
      onClose()
      return
    }

    setIsRenaming(true)
    try {
      const response = await fetch(`/api/business-plans/${planId}/rename`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planName: newName.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename plan")
      }

      const { planName } = await response.json()

      toast({
        title: "Success",
        description: "Business plan renamed successfully!",
      })

      onSuccess(planName)
      onClose()
    } catch (error) {
      console.error("Failed to rename plan:", error)
      toast({
        title: "Error",
        description: "Failed to rename business plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNewName(currentName) // Reset to original name when closing
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Rename Business Plan
          </DialogTitle>
          <DialogDescription>
            Enter a new name for your business plan. This will update the plan name everywhere it appears.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Plan Name</Label>
            <Input
              id="plan-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder="Enter plan name..."
              disabled={isRenaming}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isRenaming}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isRenaming || !newName.trim()}>
            {isRenaming ? "Renaming..." : "Rename Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
