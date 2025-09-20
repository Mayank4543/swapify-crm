"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Users, Edit, Trash2, Play, Pause, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Segment {
  id: string
  name: string
  description: string
  criteria: string
  customerCount: number
  createdDate: string
  lastUpdated: string
  status: string
  color: string
}

interface SegmentListProps {
  segments: Segment[]
}

export function SegmentList({ segments }: SegmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getColorIndicator = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: "bg-purple-500",
      blue: "bg-blue-500",
      red: "bg-red-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {segments.map((segment) => (
        <Card key={segment.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getColorIndicator(segment.color)}`}></div>
                <CardTitle className="text-lg">{segment.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View Customers
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Segment
                  </DropdownMenuItem>
                  {segment.status === "active" ? (
                    <DropdownMenuItem>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Segment
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Activate Segment
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Segment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="text-sm">{segment.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(segment.status)} variant="secondary">
                {segment.status}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                {segment.customerCount} customers
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Criteria:</span>
                <p className="text-muted-foreground mt-1">{segment.criteria}</p>
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Created: {segment.createdDate}</span>
              <span>Updated: {segment.lastUpdated}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
