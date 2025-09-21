"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Trash2, Edit, Phone, Mail, Eye, ChevronLeft, ChevronRight, Handshake } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
    _id: string;
    full_name: string;
    username: string;
    email: string;
    phone_number?: string;
}

interface Listing {
    _id: string;
    title: string;
    price: number;
    currency: string;
    cover_image?: string;
    additional_images?: string[];
    category: string;
}

interface Offer {
    _id: string;
    listing: Listing;
    buyer: User;
    seller: User;
    offerAmount: number;
    contactName: string;
    contactPhone: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    createdAt: string;
    updatedAt: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function OffersPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [offers, setOffers] = useState<Offer[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [navigatingToOfferId, setNavigatingToOfferId] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    })
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        loadOffers()
    }, [pagination.page, statusFilter, searchTerm])

    const loadOffers = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            })

            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            if (searchTerm.trim()) {
                params.append('search', searchTerm.trim())
            }

            const response = await fetch(`/api/admin/offers?${params}`)
            if (response.ok) {
                const data = await response.json()
                setOffers(data.offers)
                setPagination(data.pagination)
            } else {
                toast.error('Failed to load offers')
            }
        } catch (error) {
            toast.error('Failed to load offers')
            console.error('Load offers error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (offerId: string, newStatus: string) => {
        try {
            const response = await fetch('/api/admin/offers', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId, status: newStatus }),
            })

            if (response.ok) {
                toast.success('Offer status updated successfully')
                loadOffers()
            } else {
                let errorMessage = 'Failed to update offer status'
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.error || errorMessage
                } catch (parseError) {
                    console.error('Error parsing response:', parseError)
                    errorMessage = `Server error (${response.status})`
                }
                toast.error(errorMessage)
            }
        } catch (error) {
            toast.error('Failed to update offer status')
            console.error('Update offer error:', error)
        }
    }

    const handleDeleteOffer = async (offerId: string) => {
        if (user?.role !== 'manager') {
            toast.error('Only managers can delete offers')
            return
        }

        try {
            const response = await fetch('/api/admin/offers', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId }),
            })

            if (response.ok) {
                toast.success('Offer deleted successfully')
                loadOffers()
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to delete offer')
            }
        } catch (error) {
            toast.error('Failed to delete offer')
            console.error('Delete offer error:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'accepted': return 'bg-green-100 text-green-800'
            case 'rejected': return 'bg-red-100 text-red-800'
            case 'withdrawn': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatCurrency = (amount: number, currency?: string) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency || 'INR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getImageUrl = (imagePath?: string) => {
        if (!imagePath) return '/placeholder.jpg'

        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
        if (imagePath.startsWith('http')) return imagePath

        return `${baseUrl}/${imagePath.replace(/^\/+/, '')}`
    }

    const getListingImage = (listing: any) => {
        if (!listing) return '/placeholder.jpg'
        // Use cover_image first, then first additional_image as fallback
        const imageToUse = listing.cover_image || (listing.additional_images && listing.additional_images[0])
        return getImageUrl(imageToUse)
    }

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }

    const handleViewOffer = (offerId: string) => {
        setNavigatingToOfferId(offerId)
        router.push(`/admin/offers/${offerId}`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Offers Management</h1>
                <p className="text-muted-foreground">Manage all offers made on listings</p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Handshake className="h-5 w-5" />
                        Filter Offers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <Input
                                placeholder="Search by buyer, seller, or listing..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
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
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Offers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        ) : (
                            `Offers (${pagination.total})`
                        )}
                    </CardTitle>
                    <CardDescription>
                        All offers made by buyers on various listings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Listing</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Seller</TableHead>
                                    <TableHead>Listing Price</TableHead>
                                    <TableHead>Offer Amount</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    // Loading skeleton rows
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Skeleton className="h-12 w-12 rounded" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-3 w-28" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Skeleton className="h-8 w-8 rounded" />
                                                    <Skeleton className="h-8 w-8 rounded" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : offers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                            No offers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    offers.map((offer) => (
                                        <TableRow key={offer._id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative h-12 w-12 rounded overflow-hidden">
                                                        <Image
                                                            src={getListingImage(offer.listing)}
                                                            alt={offer.listing?.title || 'Listing'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium truncate max-w-[150px]" title={offer.listing?.title || 'N/A'}>
                                                            {offer.listing?.title || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {offer.listing?.category || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{offer.buyer?.full_name || offer.buyer?.username || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">{offer.buyer?.email || 'N/A'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{offer.seller?.full_name || offer.seller?.username || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">{offer.seller?.email || 'N/A'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {offer.listing?.price ? formatCurrency(offer.listing.price, offer.listing.currency) : 'N/A'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(offer.offerAmount, offer.listing?.currency)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{offer.contactName}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {offer.contactPhone}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={offer.status}
                                                    onValueChange={(value) => handleStatusUpdate(offer._id, value)}
                                                >
                                                    <SelectTrigger className="h-8 w-28 text-xs">
                                                        <Badge className={getStatusColor(offer.status)}>
                                                            {offer.status}
                                                        </Badge>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="accepted">Accepted</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{formatDate(offer.createdAt)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewOffer(offer._id)}
                                                        disabled={navigatingToOfferId === offer._id}
                                                    >
                                                        {navigatingToOfferId === offer._id ? (
                                                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </Button>

                                                    {user?.role === 'manager' && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this offer? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDeleteOffer(offer._id)}
                                                                        className="bg-red-500 hover:bg-red-600"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {isLoading ? (
                        <div className="flex items-center justify-between mt-4">
                            <Skeleton className="h-4 w-48" />
                            <div className="flex space-x-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-16" />
                            </div>
                        </div>
                    ) : pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                                {pagination.total} offers
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}