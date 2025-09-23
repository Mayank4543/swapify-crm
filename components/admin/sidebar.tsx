"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { LayoutDashboard, Users, Target, Mail, History, Settings, LogOut, Shield, User, Package, Handshake, X } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onClose) {
      onClose();
    }
  }

  // Combine navigation items - add manager-only items if user is manager, and always add profile
  const allNavigation = user?.role === 'manager'
    ? [...navigation, ...managerNavigation, ...profileNavigation]
    : [...navigation, ...profileNavigation]

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-card border-r border-border flex-col">
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
          <Link
            href="/admin/settings"
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Swapify CRM</h2>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {allNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
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
          <Link
            href="/admin/settings"
            onClick={handleLinkClick}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => {
              handleLogout();
              handleLinkClick();
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
