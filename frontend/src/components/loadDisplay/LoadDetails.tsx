'use client';

import { useState, useEffect } from 'react';
import CustomerDetails from './CustomerDetails';
import LaneHistory from './LaneHistory';
import Calculator from './Calculator';
import MapView from './MapView';

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

interface LoadDetailsProps {
  load: Load | null;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoadDetails({ load, onClose }: LoadDetailsProps) {
  const [activeTab, setActiveTab] = useState<'load' | 'customer' | 'history' | 'calculator'>('load');
  const [customerData, setCustomerData] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (load && activeTab === 'customer') {
      fetchCustomerDetails();
    }
  }, [load, activeTab]);

  const fetchCustomerDetails = async () => {
    if (!load) return;
    
    setLoadingCustomer(true);
    try {
      const response = await fetch(`${API_URL}/api/customers/${load.customer_id}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerData(data.data);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setLoadingCustomer(false);
    }
  };

  if (!load) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWeight = (weight: number) => {
    return new Intl.NumberFormat('en-US').format(weight);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMap(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Show Map
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('load')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'load'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Load Details
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'customer'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Customer Details
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Lane History
        </button>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'calculator'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Calculator
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'load' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Load Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Load ID</label>
                  <p className="mt-1 text-sm text-gray-900">{load.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Order ID</label>
                  <p className="mt-1 text-sm text-gray-900">{load.orderId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{load.company_name || load.customer_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Weight</label>
                  <p className="mt-1 text-sm text-gray-900">{formatWeight(load.weight)} lbs</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trailer Type</label>
                  <p className="mt-1 text-sm text-gray-900">{load.trailerType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Miles</label>
                  <p className="mt-1 text-sm text-gray-900">{load.miles}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rate</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {load.rate ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(load.rate) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quote Price</label>
                  <p className="mt-1 text-sm text-gray-900 font-semibold">
                    {load.quote_price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(load.quote_price) : 'Not calculated'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commodity</label>
                  <p className="mt-1 text-sm text-gray-900">{load.commodity}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stops</h3>
              <div className="space-y-4">
                {load.stops.map((stop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        stop.type === 'pickup' ? 'bg-green-100 text-green-800' :
                        stop.type === 'delivery' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
                      </span>
                    </div>
                    {stop.locationName && (
                      <p className="text-sm text-gray-900 font-semibold mb-1">{stop.locationName}</p>
                    )}
                    <p className="text-sm text-gray-900 font-medium">{stop.address}</p>
                    <p className="text-sm text-gray-500">
                      {stop.city}, {stop.state} {stop.zipCode}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <strong>Arrival Window:</strong><br/>
                        Early: {formatDate(stop.earlyArrival)}<br/>
                        Late: {formatDate(stop.lateArrival)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customer' && (
          <CustomerDetails 
            customerId={load.customer_id} 
            loading={loadingCustomer}
            customerData={customerData}
          />
        )}

        {activeTab === 'history' && (
          <LaneHistory 
            loadId={load.id}
            currentLoad={{
              origin: `${load.stops[0].city}, ${load.stops[0].state}`,
              destination: `${load.stops[load.stops.length - 1].city}, ${load.stops[load.stops.length - 1].state}`,
              trailerType: load.trailerType
            }}
          />
        )}

        {activeTab === 'calculator' && (
          <Calculator load={load} />
        )}
      </div>

      {/* Map View Modal */}
      {showMap && load && (
        <MapView 
          key={`map-${load.id}`}
          stops={load.stops} 
          onClose={() => setShowMap(false)} 
        />
      )}
    </div>
  );
}

