"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Mail, Users, TrendingUp, Calendar, Edit, Trash2, Play, Pause, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  targetSegments: string[]
  subject: string
  scheduledDate: string
  sentCount: number
  openRate: string
  clickRate: string
  createdDate: string
}

interface CampaignListProps {
  campaigns: Campaign[]
}

export function CampaignList({ campaigns }: CampaignListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge className={getStatusColor(campaign.status)} variant="secondary">
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm">{campaign.subject}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Campaign
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate Campaign
                  </DropdownMenuItem>
                  {campaign.status === "active" ? (
                    <DropdownMenuItem>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Campaign
                    </DropdownMenuItem>
                  ) : campaign.status === "draft" || campaign.status === "scheduled" ? (
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Launch Campaign
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Campaign
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-4 w-4" />
                  Target Segments
                </div>
                <div className="flex flex-wrap gap-1">
                  {campaign.targetSegments.map((segment) => (
                    <Badge key={segment} variant="outline" className="text-xs">
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="mr-1 h-4 w-4" />
                  Performance
                </div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">{campaign.sentCount.toLocaleString()}</span> sent
                  </div>
                  {campaign.sentCount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {campaign.openRate} open • {campaign.clickRate} click
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  Schedule
                </div>
                <div className="text-sm">
                  {campaign.scheduledDate ? (
                    <span>{campaign.scheduledDate}</span>
                  ) : (
                    <span className="text-muted-foreground">Not scheduled</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Created
                </div>
                <div className="text-sm">{campaign.createdDate}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
