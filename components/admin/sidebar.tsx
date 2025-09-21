"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard, Users, Target, Mail, History, Settings, LogOut, Shield, User, Package, Handshake } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Item List",
    href: "/admin/items",
    icon: Package,
  },
  {
    name: "Offers",
    href: "/admin/offers",
    icon: Handshake,
  },
  {
    name: "Segments",
    href: "/admin/segments",
    icon: Target,
  },
  {
    name: "Campaigns",
    href: "/admin/campaigns",
    icon: Mail,
  },
  {
    name: "Campaign History",
    href: "/admin/campaign-history",
    icon: History,
  },
]

const managerNavigation = [
  {
    name: "Admin Management",
    href: "/admin/admin-management",
    icon: Shield,
  },
]

const profileNavigation = [
  {
    name: "Your Profile",
    href: "/admin/profile",
    icon: User,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  // Combine navigation items - add manager-only items if user is manager, and always add profile
  const allNavigation = user?.role === 'manager'
    ? [...navigation, ...managerNavigation, ...profileNavigation]
    : [...navigation, ...profileNavigation]

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground">Swapify CRM</h2>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {allNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
