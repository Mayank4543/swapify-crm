'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-context';

interface RegionContextType {
  selectedRegion: string | null;
  setSelectedRegion: (region: string) => void;
  clearRegion: () => void;
  isRegionRequired: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if region selection is required (only for admins, not managers)
  const isRegionRequired = user?.role === 'admin';

  // Load region from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      const storedRegion = localStorage.getItem(`selected-region-${user.id}`);
      if (storedRegion) {
        setSelectedRegionState(storedRegion);
      }
    }
  }, [user]);

  const setSelectedRegion = (region: string) => {
    setSelectedRegionState(region);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem(`selected-region-${user.id}`, region);
    }

    // Also update the user's region in the database for admins
    if (user?.role === 'admin') {
      updateUserRegion(region);
    }
  };

  const clearRegion = () => {
    setSelectedRegionState(null);
    
    // Remove from localStorage
    if (typeof window !== 'undefined' && user) {
      localStorage.removeItem(`selected-region-${user.id}`);
    }
  };

  const updateUserRegion = async (region: string) => {
    try {
      await fetch('/api/auth/update-region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region }),
      });
    } catch (error) {
      console.error('Failed to update user region:', error);
    }
  };

  // Clear region when user logs out
  useEffect(() => {
    if (!user) {
      setSelectedRegionState(null);
    }
  }, [user]);

  return (
    <RegionContext.Provider 
      value={{ 
        selectedRegion, 
        setSelectedRegion, 
        clearRegion, 
        isRegionRequired 
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}