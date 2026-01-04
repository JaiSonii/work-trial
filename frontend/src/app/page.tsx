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

  const handleLoadSelect = (load: Load) => {
    setSelectedLoad(load);
  };

  const handleCloseDetails = () => {
    setSelectedLoad(null);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${selectedLoad ? 'mr-1/3' : ''}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Loads</h1>
          <Loads 
            onLoadSelect={handleLoadSelect} 
            selectedLoadId={selectedLoad?.id}
          />
        </div>
      </div>

      {/* Load Details Side Panel */}
      {selectedLoad && (
        <LoadDetails load={selectedLoad} onClose={handleCloseDetails} />
      )}
    </div>
  );
}
