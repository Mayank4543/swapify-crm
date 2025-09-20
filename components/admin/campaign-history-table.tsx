"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Eye, Download, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface CampaignHistory {
  id: string
  name: string
  type: string
  status: string
  targetSegments: string[]
  subject: string
  sentDate: string
  sentCount: number
  deliveredCount: number
  openCount: number
  clickCount: number
  unsubscribeCount: number
  bounceCount: number
  openRate: string
  clickRate: string
  unsubscribeRate: string
  bounceRate: string
  revenue: string
  createdDate: string
}

interface CampaignHistoryTableProps {
  campaigns: CampaignHistory[]
}

export function CampaignHistoryTable({ campaigns }: CampaignHistoryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getPerformanceColor = (rate: string, type: "open" | "click") => {
    const numRate = Number.parseFloat(rate)
    if (type === "open") {
      if (numRate >= 25) return "text-green-600"
      if (numRate >= 15) return "text-yellow-600"
      return "text-red-600"
    } else {
      if (numRate >= 5) return "text-green-600"
      if (numRate >= 2) return "text-yellow-600"
      return "text-red-600"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent Date</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Open Rate</TableHead>
            <TableHead>Click Rate</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">{campaign.subject}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {campaign.type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(campaign.status)} variant="secondary">
                  {campaign.status}
                </Badge>
              </TableCell>
              <TableCell>{campaign.sentDate}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{campaign.sentCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {campaign.deliveredCount.toLocaleString()} delivered
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className={`font-medium ${getPerformanceColor(campaign.openRate, "open")}`}>
                  {campaign.openRate}
                </div>
                <div className="text-xs text-muted-foreground">{campaign.openCount.toLocaleString()} opens</div>
              </TableCell>
              <TableCell>
                <div className={`font-medium ${getPerformanceColor(campaign.clickRate, "click")}`}>
                  {campaign.clickRate}
                </div>
                <div className="text-xs text-muted-foreground">{campaign.clickCount.toLocaleString()} clicks</div>
              </TableCell>
              <TableCell>
                <div className="font-medium text-green-600">{campaign.revenue}</div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate Campaign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
