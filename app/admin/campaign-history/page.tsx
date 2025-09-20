"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CampaignHistoryTable } from "@/components/admin/campaign-history-table"
import { CampaignAnalytics } from "@/components/admin/campaign-analytics"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Download, Filter, BarChart3, TrendingUp, Mail, Users } from "lucide-react"

// Mock historical campaign data
const mockCampaignHistory = [
  {
    id: "1",
    name: "Summer Sale 2024",
    type: "email",
    status: "completed",
    targetSegments: ["VIP Customers", "Premium Subscribers"],
    subject: "🌞 Summer Sale - Up to 50% Off!",
    sentDate: "2024-01-25",
    sentCount: 1250,
    deliveredCount: 1235,
    openCount: 304,
    clickCount: 102,
    unsubscribeCount: 8,
    bounceCount: 15,
    openRate: "24.5%",
    clickRate: "8.2%",
    unsubscribeRate: "0.6%",
    bounceRate: "1.2%",
    revenue: "$15,420",
    createdDate: "2024-01-20",
  },
  {
    id: "2",
    name: "Product Launch Announcement",
    type: "email",
    status: "completed",
    targetSegments: ["VIP Customers", "Premium Subscribers", "New Customers"],
    subject: "🚀 Introducing Our Latest Product!",
    sentDate: "2024-01-15",
    sentCount: 2847,
    deliveredCount: 2798,
    openCount: 898,
    clickCount: 347,
    unsubscribeCount: 12,
    bounceCount: 49,
    openRate: "32.1%",
    clickRate: "12.4%",
    unsubscribeRate: "0.4%",
    bounceRate: "1.7%",
    revenue: "$28,950",
    createdDate: "2024-01-10",
  },
  {
    id: "3",
    name: "Holiday Special Offer",
    type: "email",
    status: "completed",
    targetSegments: ["VIP Customers", "Premium Subscribers"],
    subject: "🎄 Holiday Special - Limited Time Only!",
    sentDate: "2023-12-20",
    sentCount: 1890,
    deliveredCount: 1867,
    openCount: 542,
    clickCount: 189,
    unsubscribeCount: 6,
    bounceCount: 23,
    openRate: "29.0%",
    clickRate: "10.1%",
    unsubscribeRate: "0.3%",
    bounceRate: "1.2%",
    revenue: "$22,340",
    createdDate: "2023-12-15",
  },
  {
    id: "4",
    name: "Welcome Series - Batch 1",
    type: "email",
    status: "completed",
    targetSegments: ["New Customers"],
    subject: "Welcome to Swapify Club! 🎉",
    sentDate: "2023-12-10",
    sentCount: 456,
    deliveredCount: 448,
    openCount: 201,
    clickCount: 67,
    unsubscribeCount: 3,
    bounceCount: 8,
    openRate: "44.9%",
    clickRate: "15.0%",
    unsubscribeRate: "0.7%",
    bounceRate: "1.8%",
    revenue: "$3,240",
    createdDate: "2023-12-05",
  },
]

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState(mockCampaignHistory)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showAnalytics, setShowAnalytics] = useState(true)

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesType = typeFilter === "all" || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate aggregate metrics
  const totalSent = campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0)
  const totalRevenue = campaigns.reduce((sum, campaign) => {
    const revenue = Number.parseFloat(campaign.revenue.replace(/[$,]/g, ""))
    return sum + revenue
  }, 0)
  const avgOpenRate =
    campaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.openRate), 0) / campaigns.length
  const avgClickRate =
    campaigns.reduce((sum, campaign) => sum + Number.parseFloat(campaign.clickRate), 0) / campaigns.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaign History</h1>
          <p className="text-muted-foreground">View detailed analytics and performance of past campaigns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            {showAnalytics ? "Hide" : "Show"} Analytics
          </Button>
          
        </div>
      </div>

      {/* Analytics Overview */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Emails delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Open Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOpenRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Generated from campaigns</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts */}
      {showAnalytics && <CampaignAnalytics campaigns={campaigns} />}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter campaigns by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <DatePickerWithRange />
            </div>
            <div>
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance History</CardTitle>
          <CardDescription>Detailed performance metrics for all campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignHistoryTable campaigns={filteredCampaigns} />
        </CardContent>
      </Card>
    </div>
  )
}
