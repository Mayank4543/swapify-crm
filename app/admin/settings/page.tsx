'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { Settings, Shield, Key, Bell, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your application preferences and account settings</p>
            </div>

            <div className="grid gap-6">
                {/* Account Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Settings className="h-5 w-5" />
                            <CardTitle>Account Settings</CardTitle>
                        </div>
                        <CardDescription>
                            Manage your account preferences and security
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="font-medium">Profile Information</div>
                                <div className="text-sm text-muted-foreground">
                                    Update your personal details and profile picture
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => window.location.href = '/admin/profile'}>
                                Manage
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Account Security</span>
                                    <Key className="h-4 w-4" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Change your password and manage security settings
                                </div>
                            </div>
                            <Button variant="outline" disabled>
                                Change Password
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Role & Permissions</span>
                                    <Shield className="h-4 w-4" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Your current role and access level
                                </div>
                            </div>
                            <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'}>
                                {user?.role === 'manager' ? 'Manager' : 'Admin'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Application Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Palette className="h-5 w-5" />
                            <CardTitle>Application Settings</CardTitle>
                        </div>
                        <CardDescription>
                            Customize your application experience
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="font-medium">Theme</div>
                                <div className="text-sm text-muted-foreground">
                                    Choose your preferred theme
                                </div>
                            </div>
                            <Button variant="outline" disabled>
                                System Default
                            </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium">Notifications</span>
                                    <Bell className="h-4 w-4" />
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Manage email and in-app notifications
                                </div>
                            </div>
                            <Button variant="outline" disabled>
                                Configure
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                        <CardDescription>
                            Information about your account and system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Username</div>
                                <div className="text-sm">{user?.username}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                <div className="text-sm">{user?.email}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Role</div>
                                <div className="text-sm">{user?.role === 'manager' ? 'Manager' : 'Admin'}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">User ID</div>
                                <div className="text-sm font-mono">{user?.id}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}