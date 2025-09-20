"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, Filter, MoreHorizontal, Calendar, Edit, Eye, Trash2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAuth } from "@/lib/auth-context"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface User {
    _id: string;
    username?: string;
    email?: string;
    user_password?: string;
    user_role?: string;
    user_avatar?: string;
    google_user_id?: string;
    google_user_avatar?: string;
    is_verified?: boolean;
    full_name?: string;
    nickname?: string;
    family_name?: string;
    last_token?: string;
    phone_number?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    address?: string;
    status?: 'active' | 'inactive' | 'pending';
    segment?: string;
    join_date?: string;
    last_visit?: string;
    created_at: string;
    updatedAt?: string;
}

export default function UsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showViewDialog, setShowViewDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [editUser, setEditUser] = useState<User | null>(null)
    const [newUser, setNewUser] = useState({ username: '', email: '', status: 'pending', segment: 'Standard' })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [usersPerPage] = useState(10)

    // Filter states
    const [segmentFilter, setSegmentFilter] = useState<string>('all')
    const [verificationFilter, setVerificationFilter] = useState<string>('all')
    const [countryFilter, setCountryFilter] = useState<string>('all')
    const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users)
            } else {
                toast.error('Failed to fetch users')
            }
        } catch (error) {
            toast.error('Error fetching users')
        } finally {
            setLoading(false)
        }
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newUser.username || !newUser.email) {
            toast.error('Username and email are required')
            return
        }

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            })

            if (response.ok) {
                toast.success('User added successfully')
                setShowAddDialog(false)
                setNewUser({ username: '', email: '', status: 'pending', segment: 'Standard' })
                fetchUsers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to add user')
            }
        } catch (error) {
            toast.error('Error adding user')
        }
    }

    const updateUserStatus = async (userId: string, status: string) => {
        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: userId, status }),
            })

            if (response.ok) {
                toast.success('User status updated')
                fetchUsers()
            } else {
                toast.error('Failed to update user status')
            }
        } catch (error) {
            toast.error('Error updating user')
        }
    }

    // Handler functions for Edit, View, Delete
    const handleViewUser = (user: User) => {
        setSelectedUser(user)
        setShowViewDialog(true)
    }

    const handleEditUser = (user: User) => {
        setEditUser({ ...user })
        setShowEditDialog(true)
    }

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user)
        setShowDeleteDialog(true)
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!editUser) return

        try {
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editUser._id,
                    username: editUser.username,
                    email: editUser.email,
                    status: editUser.status,
                    segment: editUser.segment,
                    phone_number: editUser.phone_number,
                    country: editUser.country,
                    state: editUser.state,
                    city: editUser.city,
                    pincode: editUser.pincode,
                    address: editUser.address
                }),
            })

            if (response.ok) {
                toast.success('User updated successfully')
                setShowEditDialog(false)
                setEditUser(null)
                fetchUsers()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update user')
            }
        } catch (error) {
            toast.error('Error updating user')
        }
    }

    const confirmDeleteUser = async () => {
        if (!selectedUser) return

        try {
            const response = await fetch('/api/users', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedUser._id }),
            })

            if (response.ok) {
                toast.success('User deleted successfully')
                setShowDeleteDialog(false)
                setSelectedUser(null)
                fetchUsers()
            } else {
                toast.error('Failed to delete user')
            }
        } catch (error) {
            toast.error('Error deleting user')
        }
    }

    const filteredUsers = users.filter((user) => {
        // Search filter
        const searchMatches = searchTerm === '' ||
            (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.nickname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.segment?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.phone_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.country?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Segment filter
        const segmentMatches = segmentFilter === 'all' || user.segment === segmentFilter;

        // Verification filter
        const verificationMatches = verificationFilter === 'all' ||
            (verificationFilter === 'verified' && user.is_verified) ||
            (verificationFilter === 'unverified' && !user.is_verified);

        // Country filter
        const countryMatches = countryFilter === 'all' || user.country === countryFilter;

        // Date range filter
        const dateMatches = dateRangeFilter === 'all' || (() => {
            const userDate = new Date(user.created_at);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24));

            switch (dateRangeFilter) {
                case 'today': return daysDiff === 0;
                case 'week': return daysDiff <= 7;
                case 'month': return daysDiff <= 30;
                case 'year': return daysDiff <= 365;
                default: return true;
            }
        })();

        return searchMatches && segmentMatches &&
            verificationMatches && countryMatches && dateMatches;
    })

    // Get unique values for filter options
    const uniqueCountries = [...new Set(users.map(user => user.country).filter(Boolean))] as string[];
    const uniqueSegments = [...new Set(users.map(user => user.segment).filter(Boolean))] as string[];

    // Pagination calculations
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
    const startIndex = (currentPage - 1) * usersPerPage
    const endIndex = startIndex + usersPerPage
    const currentUsers = filteredUsers.slice(startIndex, endIndex)

    // Reset to first page when search term changes
    const handleSearchChange = (term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
    }

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('')
        setSegmentFilter('all')
        setVerificationFilter('all')
        setCountryFilter('all')
        setDateRangeFilter('all')
        setCurrentPage(1)
    }

    // Check if user is manager (can delete users)
    const isManager = currentUser?.role === 'manager'

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getUserAvatar = (user: User) => {
        // Priority: 1. Google avatar, 2. User avatar, 3. First letter of username
        if (user.google_user_avatar) {
            return user.google_user_avatar;
        }
        if (user.user_avatar) {
            // If it's a filename, construct the full URL (adjust the base URL as needed)
            if (!user.user_avatar.startsWith('http')) {
                return `/uploads/avatars/${user.user_avatar}`;
            }
            return user.user_avatar;
        }
        return null; // Will fall back to initials
    };

    const getUserInitials = (user: User) => {
        const name = user.full_name || user.username || user.nickname || user.email || '';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getDisplayName = (user: User) => {
        return user.full_name || user.username || user.nickname || 'Unknown User';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'inactive': return 'bg-red-100 text-red-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">Manage and view all your users</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>

                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New User</DialogTitle>
                                <DialogDescription>
                                    Create a new user account in the system
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={newUser.username}
                                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value as any })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="segment">Segment</Label>
                                    <Select value={newUser.segment} onValueChange={(value) => setNewUser({ ...newUser, segment: value })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard">Standard</SelectItem>
                                            <SelectItem value="Premium">Premium</SelectItem>
                                            <SelectItem value="VIP">VIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Add User</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {users.filter((u) => u.status === "active").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {users.filter((u) => u.status === "inactive").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {users.filter((u) => u.status === "pending").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>User List</CardTitle>
                            <CardDescription>A list of all users in your system</CardDescription>
                        </div>
                        <div className="w-80">
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters Section */}
                    <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                        <CollapsibleContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Segment Filter */}
                                <div className="space-y-2">
                                    <Label>Segment</Label>
                                    <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Segments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Segments</SelectItem>
                                            {uniqueSegments.map((segment) => (
                                                <SelectItem key={segment} value={segment}>
                                                    {segment}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Verification Filter */}
                                <div className="space-y-2">
                                    <Label>Verification</Label>
                                    <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Users" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Users</SelectItem>
                                            <SelectItem value="verified">Verified</SelectItem>
                                            <SelectItem value="unverified">Unverified</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Country Filter */}
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Countries" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Countries</SelectItem>
                                            {uniqueCountries.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <Label>Join Date</Label>
                                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Time" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="month">This Month</SelectItem>
                                            <SelectItem value="year">This Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="space-y-2">
                                    <Label>&nbsp;</Label>
                                    <Button
                                        variant="outline"
                                        onClick={clearAllFilters}
                                        className="w-full"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>

                            {/* Filter Summary */}
                            <div className="text-sm text-muted-foreground">
                                Showing {filteredUsers.length} of {users.length} users
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Segment</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead>Last Visit</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {filteredUsers.length === 0 ? 'No users found' : 'No users on this page'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentUsers.map((user) => (
                                    <TableRow key={user._id} className="group hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage
                                                        src={getUserAvatar(user) || undefined}
                                                        alt={getDisplayName(user)}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {getUserInitials(user)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{getDisplayName(user)}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(user.status || 'pending')}>
                                                {user.status || 'pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.segment || 'None'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {formatDate(user.join_date || user.created_at)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {user.last_visit ? formatDate(user.last_visit) : 'Never'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewUser(user)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditUser(user)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {isManager && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>

                                    {[...Array(totalPages)].map((_, index) => {
                                        const pageNumber = index + 1;
                                        const isCurrentPage = pageNumber === currentPage;

                                        // Show first page, last page, current page, and pages around current page
                                        if (
                                            pageNumber === 1 ||
                                            pageNumber === totalPages ||
                                            Math.abs(pageNumber - currentPage) <= 1
                                        ) {
                                            return (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationLink
                                                        onClick={() => setCurrentPage(pageNumber)}
                                                        isActive={isCurrentPage}
                                                        className="cursor-pointer"
                                                    >
                                                        {pageNumber}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }

                                        // Show ellipsis
                                        if (
                                            pageNumber === currentPage - 2 ||
                                            pageNumber === currentPage + 2
                                        ) {
                                            return (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        return null;
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View User Dialog */}
            <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Complete information about the selected user
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6 py-4">
                            {/* Profile Section */}
                            <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage
                                        src={getUserAvatar(selectedUser) || undefined}
                                        alt={getDisplayName(selectedUser)}
                                    />
                                    <AvatarFallback className="text-lg font-semibold">
                                        {getUserInitials(selectedUser)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold">{getDisplayName(selectedUser)}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedUser.email || 'N/A'}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge className={getStatusColor(selectedUser.status || 'pending')}>
                                            {selectedUser.status || 'pending'}
                                        </Badge>
                                        {selectedUser.is_verified && (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                Verified
                                            </Badge>
                                        )}
                                        {selectedUser.google_user_id && (
                                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                Google User
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Username</Label>
                                    <p className="text-sm">{selectedUser.username || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Full Name</Label>
                                    <p className="text-sm">{selectedUser.full_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Nickname</Label>
                                    <p className="text-sm">{selectedUser.nickname || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Family Name</Label>
                                    <p className="text-sm">{selectedUser.family_name || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-sm">{selectedUser.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">User Role</Label>
                                    <p className="text-sm">{selectedUser.user_role || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Segment</Label>
                                    <p className="text-sm">{selectedUser.segment || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Phone Number</Label>
                                    <p className="text-sm">{selectedUser.phone_number || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Country</Label>
                                    <p className="text-sm">{selectedUser.country || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">State</Label>
                                    <p className="text-sm">{selectedUser.state || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">City</Label>
                                    <p className="text-sm">{selectedUser.city || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Pincode</Label>
                                    <p className="text-sm">{selectedUser.pincode || 'N/A'}</p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm">{selectedUser.address || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Google User ID</Label>
                                    <p className="text-sm font-mono">{selectedUser.google_user_id || 'N/A'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Verified Status</Label>
                                    <p className="text-sm">{selectedUser.is_verified ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Created At</Label>
                                    <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Last Updated</Label>
                                    <p className="text-sm">{formatDate(selectedUser.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user information
                        </DialogDescription>
                    </DialogHeader>
                    {editUser && (
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-username">Username</Label>
                                    <Input
                                        id="edit-username"
                                        value={editUser.username || ''}
                                        onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editUser.email || ''}
                                        onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select
                                        value={editUser.status || 'pending'}
                                        onValueChange={(value) => setEditUser({ ...editUser, status: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-segment">Segment</Label>
                                    <Select
                                        value={editUser.segment || 'Standard'}
                                        onValueChange={(value) => setEditUser({ ...editUser, segment: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select segment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Standard">Standard</SelectItem>
                                            <SelectItem value="Premium">Premium</SelectItem>
                                            <SelectItem value="VIP">VIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone Number</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editUser.phone_number || ''}
                                        onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-country">Country</Label>
                                    <Input
                                        id="edit-country"
                                        value={editUser.country || ''}
                                        onChange={(e) => setEditUser({ ...editUser, country: e.target.value })}
                                        placeholder="Enter country"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-state">State</Label>
                                    <Input
                                        id="edit-state"
                                        value={editUser.state || ''}
                                        onChange={(e) => setEditUser({ ...editUser, state: e.target.value })}
                                        placeholder="Enter state"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-city">City</Label>
                                    <Input
                                        id="edit-city"
                                        value={editUser.city || ''}
                                        onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-pincode">Pincode</Label>
                                    <Input
                                        id="edit-pincode"
                                        value={editUser.pincode || ''}
                                        onChange={(e) => setEditUser({ ...editUser, pincode: e.target.value })}
                                        placeholder="Enter pincode"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="edit-address">Address</Label>
                                    <Input
                                        id="edit-address"
                                        value={editUser.address || ''}
                                        onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                                        placeholder="Enter address"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Update User</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account for{" "}
                            <strong>{selectedUser?.username}</strong> and remove all their data from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}