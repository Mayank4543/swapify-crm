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
import { Camera, Save, User, Mail, Shield, Edit2 } from 'lucide-react';
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
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!profileData) return;

        setSaving(true);

        try {
            const formData = new FormData();
            formData.append('username', profileData.username);
            formData.append('email', profileData.email);
            formData.append('full_name', profileData.full_name || '');
            formData.append('phone', profileData.phone || '');

            if (imageFile) {
                formData.append('profile_image', imageFile);
            }

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data.profile);
                setEditMode(false);
                setImageFile(null);
                setPreviewUrl('');
                toast.success('Profile updated successfully');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile');
        } finally {
            setSaving(false);
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
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                    <p className="text-muted-foreground">Manage your account settings and preferences</p>
                </div>
                <div className="flex space-x-2">
                    {editMode ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                setEditMode(false);
                                setImageFile(null);
                                setPreviewUrl('');
                                fetchProfile();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setEditMode(true)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                </div>
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
                            <div className="relative">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={previewUrl || profileData.profile_image}
                                        alt={profileData.username}
                                    />
                                    <AvatarFallback className="text-lg">
                                        {getUserInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                {editMode && (
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </label>
                                )}
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={!editMode}
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-semibold">{profileData.username}</h3>
                                <p className="text-muted-foreground">{profileData.email}</p>
                                <Badge variant={profileData.role === 'manager' ? 'default' : 'secondary'}>
                                    {profileData.role === 'manager' ? 'Manager' : 'Admin'}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Editable Fields */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    disabled={!editMode}
                                    className={!editMode ? "bg-muted" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    disabled={!editMode}
                                    className={!editMode ? "bg-muted" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    value={profileData.full_name || ''}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    disabled={!editMode}
                                    className={!editMode ? "bg-muted" : ""}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={profileData.phone || ''}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    disabled={!editMode}
                                    className={!editMode ? "bg-muted" : ""}
                                    placeholder="Enter your phone number"
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

                {/* Account Security */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                        <CardDescription>
                            Manage your account security settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline">
                            Change Password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}