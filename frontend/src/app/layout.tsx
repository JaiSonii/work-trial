'use client';

import { useState } from 'react';
import CreateLoad from '@/components/CreateLoad';
import AILoadCreator from '@/components/AILoadCreator';
import Filters, { FilterState } from '@/components/Filters';
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isCreateLoadOpen, setIsCreateLoadOpen] = useState(false);
  const [isAILoadCreatorOpen, setIsAILoadCreatorOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    pickupCity: '',
    pickupState: '',
    deliveryCity: '',
    deliveryState: '',
    equipmentType: 'All',
    stops: 'All'
  });

  const handleLoadCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    // Trigger a page refresh or reload loads
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Store filters in a way that child components can access
    if (typeof window !== 'undefined') {
      (window as any).loadFilters = newFilters;
      // Trigger a custom event to notify Loads component
      window.dispatchEvent(new CustomEvent('filtersChanged', { detail: newFilters }));
    }
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <h1 className="text-xl font-semibold text-gray-900">TMS System</h1>
                <div className="flex items-center gap-4">
                  <Filters onFilterChange={handleFilterChange} />
                  <button
                    onClick={() => setIsAILoadCreatorOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-md hover:from-purple-700 hover:to-purple-800 transition-colors flex items-center gap-2"
                  >
                    <span>🤖</span>
                    <span>AI Create Load</span>
                  </button>
                  <button
                    onClick={() => setIsCreateLoadOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create Load
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main>
            {children}
          </main>

          {/* Create Load Modal */}
          <CreateLoad
            isOpen={isCreateLoadOpen}
            onClose={() => setIsCreateLoadOpen(false)}
            onLoadCreated={handleLoadCreated}
          />

          {/* AI Load Creator Modal */}
          <AILoadCreator
            isOpen={isAILoadCreatorOpen}
            onClose={() => setIsAILoadCreatorOpen(false)}
            onLoadCreated={handleLoadCreated}
          />
        </div>
      </body>
    </html>
  );
}
