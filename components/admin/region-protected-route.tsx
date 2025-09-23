'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRegion } from '@/lib/region-context';
import { useRouter } from 'next/navigation';
import { RegionSelectionDialog } from '@/components/admin/region-selection-dialog';
import { Loader2 } from 'lucide-react';

interface RegionProtectedRouteProps {
  children: React.ReactNode;
}

export function RegionProtectedRoute({ children }: RegionProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { selectedRegion, setSelectedRegion, isRegionRequired } = useRegion();
  const [showRegionDialog, setShowRegionDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If not authenticated, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user is admin and region is required but not selected, show region dialog
    if (user.role === 'admin' && isRegionRequired && !selectedRegion) {
      setShowRegionDialog(true);
    }
  }, [user, loading, selectedRegion, isRegionRequired, router]);

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setShowRegionDialog(false);
  };

  const handleRegionCancel = () => {
    // Redirect to login if user cancels region selection
    router.push('/login');
  };

  // Show loading while auth is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If admin needs to select region, show region dialog
  if (user.role === 'admin' && isRegionRequired && !selectedRegion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RegionSelectionDialog
          isOpen={showRegionDialog}
          onRegionSelect={handleRegionSelect}
          onCancel={handleRegionCancel}
        />
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}