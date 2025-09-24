'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
    username: string;
    email: string;
    role: 'manager' | 'admin';
    profile_image?: string;
    full_name?: string;
    phone?: string;
    created_at: string;
    last_login?: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/auth/profile');
            if (response.ok) {
                const data = await response.json();
                setProfileData(data.profile);
            } else {
                toast.error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const getUserInitials = () => {
        if (profileData?.username) {
            return profileData.username.charAt(0).toUpperCase();
        }
        return 'A';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                    <p className="text-muted-foreground">View your account information and role details</p>
                </div>
                <div className="grid gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                                <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                    <p className="text-muted-foreground">View your account information and role details</p>
                </div>
                <Card>
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Failed to load profile data</p>
                        <Button onClick={fetchProfile} className="mt-4">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                <p className="text-muted-foreground">View your account information and role details</p>
            </div>

            <div className="grid gap-6">
                {/* Profile Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                            Your account details and role information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage
                                    src={profileData.profile_image}
                                    alt={profileData.username}
                                />
                                <AvatarFallback className="text-lg">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold">{profileData.username}</h3>
                                <p className="text-muted-foreground">{profileData.email}</p>
                                <Badge variant={profileData.role === 'manager' ? 'default' : 'secondary'}>
                                    {profileData.role === 'manager' ? 'Manager' : 'Admin'}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Profile Fields */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input
                                    value={profileData.username}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    value={profileData.full_name || 'Not provided'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={profileData.phone || 'Not provided'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Read-only Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="flex items-center">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Role
                                </Label>
                                <Input
                                    value={profileData.role === 'manager' ? 'Manager (Full Access)' : 'Admin (Limited Access)'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Account Created</Label>
                                <Input
                                    value={formatDate(profileData.created_at)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            {profileData.last_login && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Last Login</Label>
                                    <Input
                                        value={formatDate(profileData.last_login)}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>


            </div>
        </div>
    );
}