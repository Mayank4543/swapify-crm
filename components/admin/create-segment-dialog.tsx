"use client"

import type React from "react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

interface CreateSegmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Criteria {
  id: string
  field: string
  operator: string
  value: string
}

export function CreateSegmentDialog({ open, onOpenChange }: CreateSegmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "blue",
  })

  const [criteria, setCriteria] = useState<Criteria[]>([{ id: "1", field: "", operator: "", value: "" }])

  const addCriteria = () => {
    setCriteria([...criteria, { id: Date.now().toString(), field: "", operator: "", value: "" }])
  }

  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id))
  }

  const updateCriteria = (id: string, field: keyof Criteria, value: string) => {
    setCriteria(criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Segment created:", { formData, criteria })
    onOpenChange(false)
    // Reset form
    setFormData({ name: "", description: "", color: "blue" })
    setCriteria([{ id: "1", field: "", operator: "", value: "" }])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Segment</DialogTitle>
          <DialogDescription>
            Define criteria to automatically group customers into segments for targeted campaigns.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
                <CardDescription>Set the name and description for your segment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                    placeholder="e.g., VIP Customers"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Describe what this segment represents..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Color
                  </Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Criteria */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Segment Criteria</CardTitle>
                    <CardDescription>
                      Define the conditions that customers must meet to be in this segment
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addCriteria}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Criteria
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {criteria.map((criterion, index) => (
                  <div key={criterion.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    {index > 0 && <span className="text-sm font-medium text-muted-foreground">AND</span>}
                    <Select
                      value={criterion.field}
                      onValueChange={(value) => updateCriteria(criterion.id, "field", value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="totalSpent">Total Spent</SelectItem>
                        <SelectItem value="joinDate">Join Date</SelectItem>
                        <SelectItem value="lastActivity">Last Activity</SelectItem>
                        <SelectItem value="segment">Current Segment</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={criterion.operator}
                      onValueChange={(value) => updateCriteria(criterion.id, "operator", value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="notEquals">Not Equals</SelectItem>
                        <SelectItem value="greaterThan">Greater Than</SelectItem>
                        <SelectItem value="lessThan">Less Than</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Value"
                      value={criterion.value}
                      onChange={(e) => updateCriteria(criterion.id, "value", e.target.value)}
                      className="flex-1"
                    />

                    {criteria.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeCriteria(criterion.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Segment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
