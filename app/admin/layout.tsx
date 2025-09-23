'use client';
import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { RegionProtectedRoute } from "@/components/admin/region-protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RegionProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </RegionProtectedRoute>
  );
}
