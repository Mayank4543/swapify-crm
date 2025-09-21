"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, Calendar, DollarSign, User, Tag, Edit, Trash2, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Seller {
    _id: string;
    username: string;
    full_name?: string;
    email?: string;
    phone_number?: string;
    profile_picture?: string;
}

interface Listing {
    _id: string;
    title: string;
    seller_id: string;
    seller_no: string;
    category_id?: string;
    price: number;
    description: string;
    cover_image: string;
    additional_images?: string[];
    category: string;
    subcategory?: string;
    location_display_name?: string;
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    created_at: string;
    deleted: boolean;
    status: 'draft' | 'pending_review' | 'active' | 'paused' | 'reserved' | 'sold' | 'cancelled' | 'expired' | 'archived';
    expires_at?: string;
    currency: 'INR';
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
}

export default function ItemDetailsPage() {
    const { user } = useAuth()
    const router = useRouter()
    const params = useParams()
    const listingId = params.id as string

    const [listing, setListing] = useState<Listing | null>(null)
    const [seller, setSeller] = useState<Seller | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        if (listingId) {
            loadListingDetails()
        }
    }, [listingId])

    const loadListingDetails = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/listings/${listingId}`)
            if (response.ok) {
                const data = await response.json()
                setListing(data.listing)
                if (data.listing.seller_id) {
                    const sellerResponse = await fetch(`/api/admin/users/${data.listing.seller_id}`)
                    if (sellerResponse.ok) {
                        const sellerData = await sellerResponse.json()
                        setSeller(sellerData.user)
                    }
                }
            } else {
                toast.error('Failed to load listing details')
                router.push('/admin/items')
            }
        } catch (error) {
            toast.error('Failed to load listing details')
            console.error('Load listing details error:', error)
            router.push('/admin/items')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusUpdate = async (newStatus: string) => {
        if (!listing) return
        try {
            setIsUpdating(true)
            const response = await fetch(`/api/listings/${listing._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            })
            if (response.ok) {
                toast.success('Listing status updated successfully')
                setListing(prev => prev ? { ...prev, status: newStatus as any } : null)
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update listing status')
            }
        } catch (error) {
            toast.error('Failed to update listing status')
            console.error('Update listing error:', error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDeleteListing = async () => {
        if (user?.role !== 'manager' || !listing) {
            toast.error('Only managers can delete listings')
            return
        }
        try {
            const response = await fetch(`/api/listings/${listing._id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                toast.success('Listing deleted successfully')
                router.push('/admin/items')
            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to delete listing')
            }
        } catch (error) {
            toast.error('Failed to delete listing')
            console.error('Delete listing error:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-200 text-gray-800'
            case 'pending_review': return 'bg-yellow-200 text-yellow-800'
            case 'active': return 'bg-green-200 text-green-800'
            case 'paused': return 'bg-blue-200 text-blue-800'
            case 'reserved': return 'bg-purple-200 text-purple-800'
            case 'sold': return 'bg-emerald-200 text-emerald-800'
            case 'cancelled': return 'bg-red-200 text-red-800'
            case 'expired': return 'bg-orange-200 text-orange-800'
            case 'archived': return 'bg-slate-200 text-slate-800'
            default: return 'bg-gray-200 text-gray-800'
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

    const allImages = listing ? [listing.cover_image, ...(listing.additional_images || [])] : []

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
    }

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
    }

    if (isLoading || !listing) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 py-8">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-20" />
                    </div>
                </div>
                <Skeleton className="h-96 w-full max-w-2xl mx-auto rounded-lg" />
                <div className="flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-3 w-3 rounded-full" />
                    ))}
                </div>
                <div className="flex gap-2 justify-center">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-16 rounded-md" />
                    ))}
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.push('/admin/items')}>
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
                            <p className="text-sm text-muted-foreground">Listing ID: {listing._id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(listing.status)} px-3 py-1 text-sm font-medium`}>
                            {listing.status.replace('_', ' ').charAt(0).toUpperCase() + listing.status.replace('_', ' ').slice(1)}
                        </Badge>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
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
                                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete this listing? This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteListing}
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
            </div>

            {/* Image Carousel */}
            <div className="relative max-w-2xl mx-auto">
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 group shadow-lg border border-gray-200">
                    <Image
                        src={getImageUrl(allImages[currentImageIndex])}
                        alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                        fill

                        className="object-contain  group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'
                        }}
                        priority
                    />
                    <div className="absolute top-4 left-4">
                        <Badge className="bg-black/80 text-white border-none px-3 py-1 text-base font-semibold backdrop-blur-sm">
                            {formatCurrency(listing.price, listing.currency)}
                        </Badge>
                    </div>
                    {allImages.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}
                </div>
                {allImages.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {allImages.map((_, index) => (
                            <button
                                key={index}
                                className={`h-2 w-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                )}
                {allImages.length > 1 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {allImages.map((image, index) => (
                            <button
                                key={index}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'} hover:border-blue-300 transition-colors`}
                                onClick={() => setCurrentImageIndex(index)}
                            >
                                <Image
                                    src={getImageUrl(image)}
                                    alt={`${listing.title} - Thumbnail ${index + 1}`}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Info */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price</p>
                                        <p className="text-lg font-semibold text-green-600">{formatCurrency(listing.price, listing.currency)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Tag className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Category</p>
                                        <p className="text-lg font-semibold">{listing.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="text-lg font-semibold">{listing.city || listing.location_display_name || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Listed</p>
                                        <p className="text-lg font-semibold">{new Date(listing.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {listing.description || 'No description provided.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Location Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <MapPin className="h-6 w-6" />
                                Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { label: 'Display Name', value: listing.location_display_name },
                                    { label: 'City', value: listing.city },
                                    { label: 'State', value: listing.state },
                                    { label: 'Country', value: listing.country },
                                    { label: 'Pincode', value: listing.pincode },
                                    {
                                        label: 'Coordinates',
                                        value: listing.latitude && listing.longitude
                                            ? `${listing.latitude.toFixed(6)}, ${listing.longitude.toFixed(6)}`
                                            : null
                                    }
                                ].map(({ label, value }) => (
                                    value && (
                                        <div key={label} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                                            <span className="font-medium text-muted-foreground">{label}</span>
                                            <span className="text-right font-medium">{value}</span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:col-span-1">
                    <Accordion type="single" collapsible className="space-y-4">
                        {/* Status Management */}
                        <AccordionItem value="status">
                            <AccordionTrigger className="text-lg font-semibold">Status Management</AccordionTrigger>
                            <AccordionContent>
                                <Card>
                                    <CardContent className="pt-6 space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                                            <Select
                                                value={listing.status}
                                                onValueChange={handleStatusUpdate}
                                                disabled={isUpdating}
                                            >
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                    <SelectItem value="pending_review">Pending Review</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="paused">Paused</SelectItem>
                                                    <SelectItem value="reserved">Reserved</SelectItem>
                                                    <SelectItem value="sold">Sold</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    <SelectItem value="expired">Expired</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {isUpdating && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                Updating status...
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Seller Information */}
                        {seller && (
                            <AccordionItem value="seller">
                                <AccordionTrigger className="text-lg font-semibold">Seller Information</AccordionTrigger>
                                <AccordionContent>
                                    <Card>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                                                    {seller.profile_picture ? (
                                                        <Image
                                                            src={getImageUrl(seller.profile_picture)}
                                                            alt={seller.username}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-lg font-semibold text-primary">
                                                            {(seller.full_name || seller.username)?.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{seller.full_name || seller.username}</p>
                                                    <p className="text-sm text-muted-foreground">@{seller.username}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                {seller.email && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span>{seller.email}</span>
                                                    </div>
                                                )}
                                                {seller.phone_number && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>{seller.phone_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {/* Listing Details */}
                        <AccordionItem value="listing-details">
                            <AccordionTrigger className="text-lg font-semibold">Listing Details</AccordionTrigger>
                            <AccordionContent>
                                <Card>
                                    <CardContent className="pt-6 space-y-3">
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-muted-foreground">Category</span>
                                            <span className="text-sm font-medium">{listing.category}</span>
                                        </div>
                                        {listing.subcategory && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm font-medium text-muted-foreground">Subcategory</span>
                                                <span className="text-sm font-medium">{listing.subcategory}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-muted-foreground">Created</span>
                                            <span className="text-sm font-medium">{formatDate(listing.created_at)}</span>
                                        </div>
                                        {listing.expires_at && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm font-medium text-muted-foreground">Expires</span>
                                                <span className="text-sm font-medium">{formatDate(listing.expires_at)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm font-medium text-muted-foreground">Deleted</span>
                                            <Badge variant={listing.deleted ? "destructive" : "secondary"} className="text-xs">
                                                {listing.deleted ? "Yes" : "No"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Technical Details */}
                        <AccordionItem value="technical-details">
                            <AccordionTrigger className="text-lg font-semibold">Technical Details</AccordionTrigger>
                            <AccordionContent>
                                <Card>
                                    <CardContent className="pt-6 space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Listing ID</p>
                                            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{listing._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Seller ID</p>
                                            <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">{listing.seller_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-1">Seller No</p>
                                            <p className="text-sm font-medium">{listing.seller_no}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}