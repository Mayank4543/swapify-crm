'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Package, Search, Filter, Download, Eye, Edit, Trash2, MapPin, Tag, DollarSign, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
    _id: string;
    title: string;
    seller_id: string;
    seller_no: string;
    price: number;
    description: string;
    cover_image: string;
    additional_images: string[];
    category: string;
    subcategory?: string;
    location_display_name?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    deleted: boolean;
    status: string;
    currency: string;
    created_at: string;
}

interface Seller {
    _id: string;
    username: string;
    full_name?: string;
}

export default function ItemListPage() {
    const { user: currentUser } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [sellers, setSellers] = useState<{ [key: string]: Seller }>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchListings();
    }, [currentPage, searchTerm, categoryFilter, statusFilter, includeDeleted]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                search: searchTerm,
                category: categoryFilter,
                status: statusFilter,
                includeDeleted: includeDeleted.toString()
            });

            const response = await fetch(`/api/listings?${params}`);
            if (response.ok) {
                const data = await response.json();
                setListings(data.listings);
                setTotalPages(data.pagination.totalPages);
                setTotalCount(data.pagination.totalCount);
                setHasNextPage(data.pagination.hasNextPage);
                setHasPrevPage(data.pagination.hasPrevPage);

                // Fetch seller information
                await fetchSellers(data.listings);
            } else {
                toast.error('Failed to load listings');
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            toast.error('Error loading listings');
        } finally {
            setLoading(false);
        }
    };

    const fetchSellers = async (listingsData: Listing[]) => {
        const sellerIds = [...new Set(listingsData.map(listing => listing.seller_id))];
        const sellersData: { [key: string]: Seller } = {};

        // Fetch seller details for each unique seller_id
        for (const sellerId of sellerIds) {
            try {
                const response = await fetch(`/api/users?id=${sellerId}`);
                if (response.ok) {
                    const data = await response.json();
                    sellersData[sellerId] = data.user;
                }
            } catch (error) {
                console.error(`Error fetching seller ${sellerId}:`, error);
            }
        }

        setSellers(sellersData);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setIncludeDeleted(false);
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (listingId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/listings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: listingId,
                    status: newStatus
                }),
            });

            if (response.ok) {
                toast.success('Listing status updated successfully');
                fetchListings();
            } else {
                toast.error('Failed to update listing status');
            }
        } catch (error) {
            toast.error('Error updating listing status');
        }
    };

    const handleDeleteListing = async (listingId: string) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) {
            return;
        }

        try {
            const response = await fetch('/api/listings', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: listingId }),
            });

            if (response.ok) {
                toast.success('Listing deleted successfully');
                fetchListings();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to delete listing');
            }
        } catch (error) {
            toast.error('Error deleting listing');
        }
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getSellerName = (sellerId: string) => {
        const seller = sellers[sellerId];
        return seller?.full_name || seller?.username || 'Unknown User';
    };

    const getImageUrl = (imageName: string) => {
        if (!imageName) return '/placeholder.jpg';
        // Assuming images are stored in uploads/listings directory
        return `/uploads/listings/${imageName}`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'sold':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const uniqueCategories = [...new Set(listings.map(listing => listing.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Item List</h1>
                    <p className="text-muted-foreground">Manage all marketplace listings</p>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Item List</h1>
                    <p className="text-muted-foreground">Manage all marketplace listings and items</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Listing Management</CardTitle>
                            <CardDescription>View and manage all marketplace listings</CardDescription>
                        </div>
                        <div className="w-80">
                            <Input
                                placeholder="Search listings..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters Section */}
                    <Collapsible open={showFilters} onOpenChange={setShowFilters}>
                        <CollapsibleContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Category Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {uniqueCategories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="sold">Sold</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Include Deleted */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Show Deleted</label>
                                    <Select value={includeDeleted.toString()} onValueChange={(value) => setIncludeDeleted(value === 'true')}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="false">Hide Deleted</SelectItem>
                                            <SelectItem value="true">Include Deleted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Clear Filters Button */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">&nbsp;</label>
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
                                Showing {listings.length} of {totalCount} listings
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No listings found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                listings.map((listing) => (
                                    <TableRow key={listing._id} className={listing.deleted ? "opacity-50" : ""}>
                                        {/* Item Column - Image + Title */}
                                        <TableCell className="font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12 rounded-md">
                                                    <AvatarImage
                                                        src={getImageUrl(listing.cover_image)}
                                                        alt={listing.title}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="rounded-md">
                                                        <Package className="h-6 w-6" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm truncate max-w-[200px]" title={listing.title}>
                                                        {listing.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        ID: {listing._id}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Seller Column */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium text-sm">
                                                    {getSellerName(listing.seller_id)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {listing.seller_no}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Price Column */}
                                        <TableCell>
                                            <div className="font-medium">
                                                {listing.price > 0 ? formatPrice(listing.price, listing.currency) : 'Free'}
                                            </div>
                                        </TableCell>

                                        {/* Category Column */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {listing.category}
                                                </Badge>
                                                {listing.subcategory && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {listing.subcategory}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Location Column */}
                                        <TableCell>
                                            <div className="max-w-[150px]">
                                                <div className="text-sm truncate" title={listing.location_display_name}>
                                                    {listing.location_display_name ||
                                                        [listing.city, listing.state].filter(Boolean).join(', ') ||
                                                        'Location not specified'}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Status Column */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge className={`text-xs ${getStatusColor(listing.status)}`}>
                                                    {listing.status}
                                                </Badge>
                                                {listing.deleted && (
                                                    <div className="text-xs text-red-500">Deleted</div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Date Column */}
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(listing.created_at)}
                                            </div>
                                        </TableCell>

                                        {/* Actions Column */}
                                        <TableCell>
                                            <div className="flex items-center space-x-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // View listing details logic here
                                                        toast.info(`Viewing ${listing.title}`);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {!listing.deleted && (
                                                    <>
                                                        <Select
                                                            value={listing.status}
                                                            onValueChange={(value) => handleStatusUpdate(listing._id, value)}
                                                        >
                                                            <SelectTrigger className="h-8 w-24 text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="active">Active</SelectItem>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                                <SelectItem value="sold">Sold</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        {currentUser?.role === 'manager' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteListing(listing._id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages} ({totalCount} total listings)
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    {hasPrevPage && (
                                        <PaginationItem>
                                            <PaginationPrevious
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(currentPage - 1);
                                                }}
                                            />
                                        </PaginationItem>
                                    )}

                                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        const pageNumber = Math.max(1, currentPage - 2) + i;
                                        if (pageNumber > totalPages) return null;

                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={pageNumber === currentPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setCurrentPage(pageNumber);
                                                    }}
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    {hasNextPage && (
                                        <PaginationItem>
                                            <PaginationNext
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurrentPage(currentPage + 1);
                                                }}
                                            />
                                        </PaginationItem>
                                    )}
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}