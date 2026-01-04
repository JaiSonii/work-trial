'use client';

import { useState, useEffect } from 'react';
import CustomerDetails from './CustomerDetails';
import LaneHistory from './LaneHistory';
import Calculator from './Calculator';
import MapView from './MapView';
import EditLoad from '../EditLoad';

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
  onLoadUpdated?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoadDetails({ load, onClose, onLoadUpdated }: LoadDetailsProps) {
  const [activeTab, setActiveTab] = useState<'load' | 'customer' | 'history' | 'calculator'>('load');
  const [customerData, setCustomerData] = useState<any>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' CST';
  };

  const formatWeight = (weight: number) => {
    return new Intl.NumberFormat('en-US').format(weight);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMap(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            View on Map
          </button>
          <button
            onClick={() => window.open('#', '_blank')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Link to Loadboard
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
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
            {/* Load ID Display */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Load ID</div>
              <div className="text-2xl font-bold text-gray-900">{load.orderId || load.id}</div>
            </div>

            {/* Shipment Stops */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SHIPMENT STOPS</h3>
              <div className="space-y-4">
                {load.stops.map((stop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{index + 1}. {stop.locationName || `${stop.city} (${stop.type})`}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          stop.type === 'pickup' ? 'bg-green-100 text-green-800' :
                          stop.type === 'delivery' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {stop.type === 'pickup' ? 'Pickup - Live' : stop.type === 'delivery' ? 'Dropoff - Live' : 'Intermediate'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{stop.address}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {stop.city}, {stop.state}, {stop.zipCode}
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Date/Time:</strong> {formatDate(stop.earlyArrival)} - {formatDate(stop.lateArrival)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Load Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">LOAD INFORMATION</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Weight</label>
                  <p className="mt-1 text-sm text-gray-900">{formatWeight(load.weight)} lbs</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Excessive Transit</label>
                  <p className="mt-1 text-sm text-gray-900">No</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trailer Type</label>
                  <p className="mt-1 text-sm text-gray-900">{load.trailerType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Weekend Pickup</label>
                  <p className="mt-1 text-sm text-gray-900">Yes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Team Driver</label>
                  <p className="mt-1 text-sm text-gray-900">No</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hazmat</label>
                  <p className="mt-1 text-sm text-gray-900">No</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Miles</label>
                  <p className="mt-1 text-sm text-gray-900">{load.miles}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commodity</label>
                  <p className="mt-1 text-sm text-gray-900">{load.commodity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stops</label>
                  <p className="mt-1 text-sm text-gray-900">{load.stops.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requirements</label>
                  <p className="mt-1 text-sm text-gray-900">Not specified</p>
                </div>
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

      {/* Edit Load Modal */}
      {showEdit && load && (
        <EditLoad
          isOpen={showEdit}
          load={load}
          onClose={() => setShowEdit(false)}
          onLoadUpdated={() => {
            setShowEdit(false);
            if (onLoadUpdated) onLoadUpdated();
          }}
        />
      )}
    </div>
  );
}

