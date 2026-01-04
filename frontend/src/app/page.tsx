'use client';

import { useState } from 'react';
import Loads from '@/components/Loads';
import LoadDetails from '@/components/loadDisplay/LoadDetails';

interface Stop {
  type: string;
  locationName?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  earlyArrival: string;
  lateArrival: string;
}

interface Load {
  id: string;
  orderId?: string;
  stops: Stop[];
  weight: number;
  trailerType: string;
  miles: number;
  commodity: string;
  rate?: number;
  quote_price?: number;
  customer_id: string;
  company_name?: string;
}

export default function Home() {
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLoadSelect = (load: Load) => {
    setSelectedLoad(load);
  };

  const handleCloseDetails = () => {
    setSelectedLoad(null);
  };

  const handleLoadUpdated = () => {
    setRefreshKey(prev => prev + 1);
    // Refresh the selected load
    if (selectedLoad) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/loads/${selectedLoad.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSelectedLoad(data.data);
          }
        });
    }
  };

  const handleLoadDeleted = () => {
    setSelectedLoad(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content Area - Left Panel */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto ${selectedLoad ? 'w-1/2' : 'w-full'}`}>
        <div className="p-6">
          <Loads 
            key={refreshKey}
            onLoadSelect={handleLoadSelect} 
            selectedLoadId={selectedLoad?.id}
            onLoadDeleted={handleLoadDeleted}
          />
        </div>
      </div>

      {/* Load Details Side Panel - Right Panel */}
      {selectedLoad && (
        <div className="w-1/2 border-l border-gray-200 overflow-y-auto">
          <LoadDetails 
            load={selectedLoad} 
            onClose={handleCloseDetails}
            onLoadUpdated={handleLoadUpdated}
          />
        </div>
      )}
    </div>
  );
}
