'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Mail, TrendingUp } from "lucide-react"

interface User {
  _id: string;
  status: 'active' | 'inactive' | 'pending';
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  const stats = [
    {
      title: "Total Users",
      value: loading ? "..." : totalUsers.toString(),
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: loading ? "..." : activeUsers.toString(),
      description: `${pendingUsers} pending approval`,
      icon: Target,
      color: "text-green-600",
    },
    {
      title: "Campaigns Running",
      value: "12",
      description: "3 launching soon",
      icon: Mail,
      color: "text-purple-600",
    },
    {
      title: "User Growth Rate",
      value: "18.2%",
      description: "+2.1% from last month",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Swapify Club CRM</h1>
        <p className="text-muted-foreground">Manage your users, segments, and campaigns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user interactions and campaign updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Campaign "Summer Sale" launched</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New segment created</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Users className="h-6 w-6 mb-2 text-blue-600" />
                <p className="text-sm font-medium">Add User</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Target className="h-6 w-6 mb-2 text-green-600" />
                <p className="text-sm font-medium">Create Segment</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <Mail className="h-6 w-6 mb-2 text-purple-600" />
                <p className="text-sm font-medium">New Campaign</p>
              </button>
              <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                <TrendingUp className="h-6 w-6 mb-2 text-orange-600" />
                <p className="text-sm font-medium">View Reports</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
