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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Mail, Users, Settings, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const availableSegments = [
  { id: "1", name: "VIP Customers", count: 45 },
  { id: "2", name: "New Customers", count: 128 },
  { id: "3", name: "Inactive Users", count: 67 },
  { id: "4", name: "Premium Subscribers", count: 234 },
  { id: "5", name: "Cart Abandoners", count: 89 },
]

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
    targetSegments: [] as string[],
    scheduleType: "now",
    scheduledDate: undefined as Date | undefined,
  })

  const handleSegmentToggle = (segmentId: string) => {
    setFormData({
      ...formData,
      targetSegments: formData.targetSegments.includes(segmentId)
        ? formData.targetSegments.filter((id) => id !== segmentId)
        : [...formData.targetSegments, segmentId],
    })
  }

  const getTotalRecipients = () => {
    return availableSegments
      .filter((segment) => formData.targetSegments.includes(segment.id))
      .reduce((total, segment) => total + segment.count, 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Campaign created:", formData)
    onOpenChange(false)
    // Reset form
    setCurrentStep(1)
    setFormData({
      name: "",
      type: "email",
      subject: "",
      content: "",
      targetSegments: [],
      scheduleType: "now",
      scheduledDate: undefined,
    })
  }

  const nextStep = () => setCurrentStep(currentStep + 1)
  const prevStep = () => setCurrentStep(currentStep - 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>Create a targeted marketing campaign for your customers.</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 py-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {step}
              </div>
              {step < 4 && <div className="w-8 h-px bg-muted mx-2" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Campaign Details</CardTitle>
                </div>
                <CardDescription>Set up the basic information for your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Sale 2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email Campaign</SelectItem>
                      <SelectItem value="sms">SMS Campaign</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter your email subject line"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Target Audience */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Target Audience</CardTitle>
                </div>
                <CardDescription>Select the customer segments you want to target</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {availableSegments.map((segment) => (
                    <div key={segment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={segment.id}
                        checked={formData.targetSegments.includes(segment.id)}
                        onCheckedChange={() => handleSegmentToggle(segment.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={segment.id} className="font-medium">
                          {segment.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{segment.count} customers</p>
                      </div>
                    </div>
                  ))}
                </div>
                {formData.targetSegments.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">
                      Total Recipients: {getTotalRecipients().toLocaleString()} customers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <CardTitle>Campaign Content</CardTitle>
                </div>
                <CardDescription>Create the content for your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your email content here..."
                    className="min-h-[200px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <CardTitle>Schedule & Send</CardTitle>
                </div>
                <CardDescription>Choose when to send your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="now"
                      name="schedule"
                      value="now"
                      checked={formData.scheduleType === "now"}
                      onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                    />
                    <Label htmlFor="now">Send immediately</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="later"
                      name="schedule"
                      value="later"
                      checked={formData.scheduleType === "later"}
                      onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                    />
                    <Label htmlFor="later">Schedule for later</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="draft"
                      name="schedule"
                      value="draft"
                      checked={formData.scheduleType === "draft"}
                      onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                    />
                    <Label htmlFor="draft">Save as draft</Label>
                  </div>
                </div>

                {formData.scheduleType === "later" && (
                  <div className="space-y-2">
                    <Label>Schedule Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.scheduledDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.scheduledDate ? (
                            formData.scheduledDate.toLocaleDateString()
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.scheduledDate}
                          onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {currentStep < 4 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
