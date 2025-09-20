"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CampaignList } from "@/components/admin/campaign-list"
import { CreateCampaignDialog } from "@/components/admin/create-campaign-dialog"
import { Plus, Mail, Send, Clock, TrendingUp } from "lucide-react"

// Mock campaign data
const mockCampaigns = [
  {
    id: "1",
    name: "Summer Sale 2024",
    type: "email",
    status: "active",
    targetSegments: ["VIP Customers", "Premium Subscribers"],
    subject: "🌞 Summer Sale - Up to 50% Off!",
    scheduledDate: "2024-01-25",
    sentCount: 1250,
    openRate: "24.5%",
    clickRate: "8.2%",
    createdDate: "2024-01-20",
  },
  {
    id: "2",
    name: "Welcome Series - New Customers",
    type: "email",
    status: "scheduled",
    targetSegments: ["New Customers"],
    subject: "Welcome to Swapify Club! 🎉",
    scheduledDate: "2024-01-26",
    sentCount: 0,
    openRate: "0%",
    clickRate: "0%",
    createdDate: "2024-01-21",
  },
  {
    id: "3",
    name: "Re-engagement Campaign",
    type: "email",
    status: "draft",
    targetSegments: ["Inactive Users"],
    subject: "We miss you! Come back for exclusive offers",
    scheduledDate: "",
    sentCount: 0,
    openRate: "0%",
    clickRate: "0%",
    createdDate: "2024-01-19",
  },
  {
    id: "4",
    name: "Product Launch Announcement",
    type: "email",
    status: "completed",
    targetSegments: ["VIP Customers", "Premium Subscribers", "New Customers"],
    subject: "🚀 Introducing Our Latest Product!",
    scheduledDate: "2024-01-15",
    sentCount: 2847,
    openRate: "32.1%",
    clickRate: "12.4%",
    createdDate: "2024-01-10",
  },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const scheduledCampaigns = campaigns.filter((c) => c.status === "scheduled").length
  const totalSent = campaigns.reduce((total, campaign) => total + campaign.sentCount, 0)
  const avgOpenRate =
    campaigns
      .filter((c) => c.sentCount > 0)
      .reduce((total, campaign) => total + Number.parseFloat(campaign.openRate), 0) /
    campaigns.filter((c) => c.sentCount > 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaign Management</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">{activeCampaigns} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCampaigns}</div>
            <p className="text-xs text-muted-foreground">Ready to send</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>Manage your marketing campaigns and track performance</CardDescription>
            </div>
            <div className="w-80">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CampaignList campaigns={filteredCampaigns} />
        </CardContent>
      </Card>

      <CreateCampaignDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  )
}
