"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SegmentList } from "@/components/admin/segment-list"
import { CreateSegmentDialog } from "@/components/admin/create-segment-dialog"
import { Plus, Users, Target, TrendingUp } from "lucide-react"

// Mock segment data
const mockSegments = [
  {
    id: "1",
    name: "VIP Customers",
    description: "High-value customers with spending over $5,000",
    criteria: "Total Spent > $5,000",
    customerCount: 45,
    createdDate: "2024-01-10",
    lastUpdated: "2024-01-20",
    status: "active",
    color: "purple",
  },
  {
    id: "2",
    name: "New Customers",
    description: "Customers who joined in the last 30 days",
    criteria: "Join Date < 30 days ago",
    customerCount: 128,
    createdDate: "2024-01-15",
    lastUpdated: "2024-01-21",
    status: "active",
    color: "blue",
  },
  {
    id: "3",
    name: "Inactive Users",
    description: "Customers with no activity in the last 60 days",
    criteria: "Last Activity > 60 days ago",
    customerCount: 67,
    createdDate: "2024-01-05",
    lastUpdated: "2024-01-18",
    status: "active",
    color: "red",
  },
  {
    id: "4",
    name: "Premium Subscribers",
    description: "Customers with premium subscription status",
    criteria: "Subscription = Premium",
    customerCount: 234,
    createdDate: "2023-12-20",
    lastUpdated: "2024-01-19",
    status: "active",
    color: "green",
  },
  {
    id: "5",
    name: "Cart Abandoners",
    description: "Customers who abandoned their cart in the last 7 days",
    criteria: "Cart Abandoned < 7 days ago",
    customerCount: 89,
    createdDate: "2024-01-12",
    lastUpdated: "2024-01-21",
    status: "paused",
    color: "orange",
  },
]

export default function SegmentsPage() {
  const [segments, setSegments] = useState(mockSegments)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredSegments = segments.filter(
    (segment) =>
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      segment.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalCustomersInSegments = segments.reduce((total, segment) => total + segment.customerCount, 0)
  const activeSegments = segments.filter((s) => s.status === "active").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Segments</h1>
          <p className="text-muted-foreground">Create and manage customer segments for targeted campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Segments</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.length}</div>
            <p className="text-xs text-muted-foreground">{activeSegments} active segments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers in Segments</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomersInSegments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all segments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Segment Size</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalCustomersInSegments / segments.length)}</div>
            <p className="text-xs text-muted-foreground">Customers per segment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Segment Overview</CardTitle>
              <CardDescription>Manage your customer segments and their criteria</CardDescription>
            </div>
            <div className="w-80">
              <Input
                placeholder="Search segments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SegmentList segments={filteredSegments} />
        </CardContent>
      </Card>

      <CreateSegmentDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
