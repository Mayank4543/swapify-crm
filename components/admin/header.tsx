'use client';

import { Bell, Search, User, LogOut, Settings, MapPin, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { useRegion } from "@/lib/region-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { selectedRegion } = useRegion();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
  };

  // Get user's initials for avatar fallback
  const getUserInitials = () => {
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <header className="bg-card border-b border-border px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Region Display for Admins */}
          {user?.role === 'admin' && selectedRegion && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-primary/10 rounded-lg border">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{selectedRegion}</span>
              <Badge variant="outline" className="text-xs hidden md:inline-flex">
                Active Region
              </Badge>
            </div>
          )}
          
          {/* Manager Access Indicator */}
          {user?.role === 'manager' && (
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">All Regions</span>
              <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-300 hidden md:inline-flex">
                Manager Access
              </Badge>
            </div>
          )}

          {/* Search - Hidden on mobile */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers, campaigns..." className="pl-10 w-60 lg:w-80" />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile search button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 h-auto">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={user?.profile_image} alt={user?.username} />
                  <AvatarFallback>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{user?.username}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <span className="font-medium">{user?.username}</span>
                <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                <Badge
                  variant={user?.role === 'manager' ? 'default' : 'secondary'}
                  className="text-xs w-fit mt-1"
                >
                  {user?.role === 'manager' ? 'Manager' : 'Admin'}
                </Badge>
                {/* Mobile region display */}
                {user?.role === 'admin' && selectedRegion && (
                  <Badge variant="outline" className="text-xs w-fit mt-1 sm:hidden">
                    Region: {selectedRegion}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Your Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
