"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { ArrowLeft, Phone, Mail, Edit, Trash2, Handshake, MapPin, Calendar, IndianRupee } from 'lucide-react'
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
    description?: string;
    location_display_name?: string;
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

export default function OfferDetailsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const offerId = params.id as string

    const [offer, setOffer] = useState<Offer | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)

    useEffect(() => {
        if (offerId) {
            loadOfferDetails()
        }
    }, [offerId])

    const loadOfferDetails = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/admin/offers/${offerId}`)
            if (response.ok) {
                const data = await response.json()
                setOffer(data.offer)
            } else {
                toast.error('Failed to load offer details')
                router.push('/admin/offers')
            }
        } catch (error) {
            toast.error('Failed to load offer details')
            console.error('Load offer details error:', error)
            router.push('/admin/offers')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!offer) return

        try {
            setIsUpdating(true)
            const response = await fetch('/api/admin/offers', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId: offer._id, status: newStatus }),
            })

            if (response.ok) {
                toast.success('Offer status updated successfully')
                setOffer(prev => prev ? { ...prev, status: newStatus as any } : null)
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update offer status')
            }
        } catch (error) {
            toast.error('Failed to update offer status')
            console.error('Update offer error:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteOffer = async () => {
        if (user?.role !== 'manager' || !offer) {
            toast.error('Only managers can delete offers')
            return
        }

        try {
            const response = await fetch('/api/admin/offers', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId: offer._id }),
            })

            if (response.ok) {
                toast.success('Offer deleted successfully')
                router.push('/admin/offers')
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
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
            case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
            month: 'long',
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
        const imageToUse = listing.cover_image || (listing.additional_images && listing.additional_images[0])
        return getImageUrl(imageToUse)
    }

    if (isLoading || !offer) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-32" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Listing Information Skeleton */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-6 w-40" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex space-x-4">
                                    <Skeleton className="h-32 w-32 rounded-lg" />
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Skeleton className="h-6 w-48 mb-2" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-6 w-32" />
                                            </div>
                                            <div>
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-6 w-32" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-16 w-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buyer Information Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-36" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i}>
                                            <Skeleton className="h-4 w-20 mb-1" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Seller Information Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-36" />
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i}>
                                            <Skeleton className="h-4 w-20 mb-1" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32" />
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-6">
                        {/* Status Management Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-40" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-24 mb-2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>

                        {/* Contact Information Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40 mb-2" />
                                <Skeleton className="h-4 w-36" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-28 mb-1" />
                                    <Skeleton className="h-5 w-36" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-20" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Skeleton className="h-4 w-16 mb-1" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-24 mb-1" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => router.push('/admin/offers')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Offers
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Offer Details</h1>
                        <p className="text-muted-foreground">Complete information about this offer</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(offer.status)} text-sm px-3 py-1`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </Badge>
                    {user?.role === 'manager' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
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
                                        onClick={handleDeleteOffer}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Listing Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Handshake className="h-5 w-5" />
                                Listing Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-4">
                                <div className="relative h-32 w-32 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={getListingImage(offer.listing)}
                                        alt={offer.listing?.title || 'Listing'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-semibold">{offer.listing?.title || 'N/A'}</h3>
                                        <p className="text-muted-foreground">{offer.listing?.category || 'N/A'}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Listing Price</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {offer.listing?.price ? formatCurrency(offer.listing.price, offer.listing.currency) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Offer Amount</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                {formatCurrency(offer.offerAmount, offer.listing?.currency)}
                                            </p>
                                        </div>
                                    </div>

                                    {offer.listing?.location_display_name && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {offer.listing.location_display_name}
                                        </div>
                                    )}

                                    {offer.listing?.description && (
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                                            <p className="text-sm mt-1">{offer.listing.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Buyer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Buyer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="font-medium">{offer.buyer?.full_name || offer.buyer?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="font-medium">{offer.buyer?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p>{offer.buyer?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                {offer.buyer?.phone_number && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p>{offer.buyer.phone_number}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Seller Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Seller Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="font-medium">{offer.seller?.full_name || offer.seller?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Username</p>
                                    <p className="font-medium">{offer.seller?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p>{offer.seller?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                {offer.seller?.phone_number && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <p>{offer.seller.phone_number}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Offer Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Offer Message</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm leading-relaxed">{offer.message}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Management</CardTitle>
                            <CardDescription>Update the offer status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                                <Select
                                    value={offer.status}
                                    onValueChange={handleStatusUpdate}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isUpdating && (
                                <p className="text-sm text-muted-foreground">Updating status...</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Buyer's contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                                <p className="font-medium">{offer.contactName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                                <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{offer.contactPhone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{formatDate(offer.createdAt)}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-sm">{formatDate(offer.updatedAt)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}