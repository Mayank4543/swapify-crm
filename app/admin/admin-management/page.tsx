'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Shield, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Admin {
    _id: string;
    username: string;
    role: string;
}

export default function AdminManagementPage() {
    const { user } = useAuth();
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteAdmin, setDeleteAdmin] = useState<Admin | null>(null);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect non-managers
    useEffect(() => {
        if (user && user.role !== 'manager') {
            window.location.href = '/admin';
        }
    }, [user]);

    // Load admins
    useEffect(() => {
        if (user?.role === 'manager') {
            loadAdmins();
        }
    }, [user]);

    const loadAdmins = async () => {
        try {
            const response = await fetch('/api/admin/manage');
            if (response.ok) {
                const data = await response.json();
                setAdmins(data.admins);
            } else {
                toast.error('Failed to load admins');
            }
        } catch (error) {
            toast.error('Failed to load admins');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/manage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Admin created successfully');
                setIsCreateDialogOpen(false);
                setFormData({ username: '', password: '' });
                loadAdmins();
            } else {
                setFormError(data.error || 'Failed to create admin');
            }
        } catch (error) {
            setFormError('Failed to create admin');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!deleteAdmin) return;

        try {
            const response = await fetch('/api/admin/manage', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: deleteAdmin.username }),
            });

            if (response.ok) {
                toast.success('Admin deleted successfully');
                setDeleteAdmin(null);
                loadAdmins();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete admin');
            }
        } catch (error) {
            toast.error('Failed to delete admin');
        }
    };

    // Show access denied for non-managers
    if (user?.role !== 'manager') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>
                            Only managers can access admin management
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Admin Management</h1>
                    <p className="text-muted-foreground">Create and manage admin accounts</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Admin
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Admin</DialogTitle>
                            <DialogDescription>
                                Create a new admin account with login credentials
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            {formError && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{formError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="create-username">Username</Label>
                                <Input
                                    id="create-username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    placeholder="Enter admin username"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="create-password">Password</Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    placeholder="Enter admin password"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Admin'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Accounts</CardTitle>
                    <CardDescription>
                        Manage admin user accounts and their access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading admins...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            No admin accounts found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    admins.map((admin) => (
                                        <TableRow key={admin._id}>
                                            <TableCell className="flex items-center space-x-2">
                                                <User className="h-4 w-4" />
                                                <span>{admin.username}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">Admin</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDeleteAdmin(admin)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteAdmin} onOpenChange={() => setDeleteAdmin(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the admin account for "{deleteAdmin?.username}"?
                            This action cannot be undone and the admin will lose access immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAdmin} className="bg-red-600 hover:bg-red-700">
                            Delete Admin
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}