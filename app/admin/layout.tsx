'use client';

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Admin layout - user:', user, 'loading:', loading);
    if (!loading && !user) {
      console.log('No user in admin layout, redirecting to login');
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    console.log('Admin layout showing loading state');
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <Skeleton className="h-16 w-full" />
          <div className="flex-1 p-6">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Admin layout - no user, showing loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div>Checking authentication...</div>
        </div>
      </div>
    );
  }

  console.log('Admin layout rendering with user:', user.username);
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
