'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth-context';
import { useRegion } from '@/lib/region-context';
import { RegionSelectionDialog } from '@/components/admin/region-selection-dialog';

function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRegionDialog, setShowRegionDialog] = useState(false);
    const { login, user } = useAuth();
    const { selectedRegion, setSelectedRegion, isRegionRequired } = useRegion();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            // If user is logged in and it's a manager, go directly to dashboard
            if (user.role === 'manager') {
                window.location.replace('/admin');
            } 
            // If user is admin and has selected region, go to dashboard
            else if (user.role === 'admin' && selectedRegion) {
                window.location.replace('/admin');
            }
            // If user is admin but no region selected, show region dialog
            else if (user.role === 'admin' && !selectedRegion) {
                setShowRegionDialog(true);
            }
        }
    }, [user, selectedRegion]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(username, password);

            if (success) {
                console.log('Login successful, checking role for region selection...');
                // Region dialog will be shown in useEffect if needed
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegionSelect = (region: string) => {
        setSelectedRegion(region);
        setShowRegionDialog(false);
        // Navigate to dashboard after region selection
        window.location.replace('/admin');
    };

    const handleRegionCancel = () => {
        // Log out the user if they cancel region selection
        setShowRegionDialog(false);
        window.location.replace('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <img
                            src="/placeholder-logo.svg"
                            alt="Swapify Club"
                            className="h-12 w-auto mx-auto"
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold">Swapify CRM</CardTitle>
                    <CardDescription>
                        Sign in to access the admin dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        <p>Contact your manager for login credentials</p>
                    </div>
                </CardContent>
            </Card>

            {/* Region Selection Dialog */}
            <RegionSelectionDialog
                isOpen={showRegionDialog}
                onRegionSelect={handleRegionSelect}
                onCancel={handleRegionCancel}
            />
        </div>
    );
}

export default function LoginPage() {
    return <LoginForm />;
}