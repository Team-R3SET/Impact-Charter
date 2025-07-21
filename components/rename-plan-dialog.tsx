"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName)
    }
  }, [isOpen, currentName])

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === currentName) {
      onClose()
      return
    }

    setIsRenaming(true)
    try {
      const response = await fetch(`/api/business-plans/${planId}/rename`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newName: newName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to rename plan")
      }

      onSuccess(newName.trim())
      toast({
        title: "Plan renamed",
        description: `The plan has been renamed to "${newName.trim()}".`,
      })
      onClose()
    } catch (error) {
      console.error("Error renaming plan:", error)
      toast({
        title: "Error",
        description: "Failed to rename the plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Plan</DialogTitle>
          <DialogDescription>Enter a new name for your business plan.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="plan-name" className="sr-only">
            Plan Name
          </Label>
          <Input
            id="plan-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new plan name"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRenaming}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={isRenaming || !newName.trim() || newName.trim() === currentName}
            className="w-24"
          >
            {isRenaming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
