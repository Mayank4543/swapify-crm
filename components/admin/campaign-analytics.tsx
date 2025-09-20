"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface CampaignHistory {
  id: string
  name: string
  sentDate: string
  sentCount: number
  openRate: string
  clickRate: string
  revenue: string
}

interface CampaignAnalyticsProps {
  campaigns: CampaignHistory[]
}

export function CampaignAnalytics({ campaigns }: CampaignAnalyticsProps) {
  // Prepare data for charts
  const performanceData = campaigns.map((campaign) => ({
    name: campaign.name.length > 15 ? campaign.name.substring(0, 15) + "..." : campaign.name,
    openRate: Number.parseFloat(campaign.openRate),
    clickRate: Number.parseFloat(campaign.clickRate),
    sent: campaign.sentCount,
    revenue: Number.parseFloat(campaign.revenue.replace(/[$,]/g, "")),
  }))

  const timelineData = campaigns
    .sort((a, b) => new Date(a.sentDate).getTime() - new Date(b.sentDate).getTime())
    .map((campaign) => ({
      date: campaign.sentDate,
      openRate: Number.parseFloat(campaign.openRate),
      clickRate: Number.parseFloat(campaign.clickRate),
      revenue: Number.parseFloat(campaign.revenue.replace(/[$,]/g, "")),
    }))

  const typeDistribution = campaigns.reduce(
    (acc, campaign) => {
      const type = campaign.type || "email"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Open and click rates by campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="openRate" fill="#8884d8" name="Open Rate %" />
              <Bar dataKey="clickRate" fill="#82ca9d" name="Click Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Timeline</CardTitle>
          <CardDescription>Revenue generated over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Types</CardTitle>
          <CardDescription>Distribution of campaign types</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
          <CardDescription>Open and click rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="openRate" stroke="#8884d8" name="Open Rate %" />
              <Line type="monotone" dataKey="clickRate" stroke="#82ca9d" name="Click Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
