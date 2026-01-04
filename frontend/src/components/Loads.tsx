'use client';

import { useState, useEffect } from 'react';
import { FilterState } from './Filters';

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
  notes?: string;
  customer_id: string;
  company_name?: string;
}

interface LoadsProps {
  onLoadSelect: (load: Load) => void;
  selectedLoadId?: string;
  onLoadDeleted?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Loads({ onLoadSelect, selectedLoadId, onLoadDeleted }: LoadsProps) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    pickupCity: '',
    pickupState: '',
    deliveryCity: '',
    deliveryState: '',
    equipmentType: 'All',
    stops: 'All'
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date-newest' | 'date-oldest' | 'distance-shortest' | 'distance-longest'>('date-newest');

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.pickupCity) params.append('pickupCity', filters.pickupCity);
      if (filters.pickupState) params.append('pickupState', filters.pickupState);
      if (filters.deliveryCity) params.append('deliveryCity', filters.deliveryCity);
      if (filters.deliveryState) params.append('deliveryState', filters.deliveryState);
      if (filters.equipmentType && filters.equipmentType !== 'All') {
        params.append('equipmentType', filters.equipmentType);
      }
      if (filters.stops && filters.stops !== 'All') {
        params.append('stops', filters.stops);
      }
      
      const response = await fetch(`${API_URL}/api/loads?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLoads(data.data);
        setTotalCount(data.pagination.totalCount);
        setTotalPages(data.pagination.totalPages);
      } else {
        setError(data.message || 'Failed to fetch loads');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoads();
  }, [page, limit, filters]);

  useEffect(() => {
    const handleFilterChange = (event: CustomEvent<FilterState>) => {
      setFilters(event.detail);
      setPage(1);
    };

    window.addEventListener('filtersChanged', handleFilterChange as EventListener);
    return () => {
      window.removeEventListener('filtersChanged', handleFilterChange as EventListener);
    };
  }, []);

  const handleDelete = async (e: React.MouseEvent, loadId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this load?')) return;
    
    setDeletingId(loadId);
    try {
      const response = await fetch(`${API_URL}/api/loads/${loadId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        fetchLoads();
        if (onLoadDeleted) onLoadDeleted();
      } else {
        alert('Error deleting load: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting load:', err);
      alert('Error deleting load');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatWeight = (weight: number) => {
    return new Intl.NumberFormat('en-US').format(weight);
  };

  const getPickupCount = (stops: Stop[]) => {
    return stops.filter(s => s.type === 'pickup').length;
  };

  const getDeliveryCount = (stops: Stop[]) => {
    return stops.filter(s => s.type === 'delivery').length;
  };

  const sortLoads = (loadsToSort: Load[]): Load[] => {
    const sorted = [...loadsToSort];
    
    switch (sortBy) {
      case 'date-newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.stops[0].earlyArrival).getTime();
          const dateB = new Date(b.stops[0].earlyArrival).getTime();
          return dateB - dateA; // Newest first
        });
      case 'date-oldest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.stops[0].earlyArrival).getTime();
          const dateB = new Date(b.stops[0].earlyArrival).getTime();
          return dateA - dateB; // Oldest first
        });
      case 'distance-shortest':
        return sorted.sort((a, b) => a.miles - b.miles); // Shortest first
      case 'distance-longest':
        return sorted.sort((a, b) => b.miles - a.miles); // Longest first
      default:
        return sorted;
    }
  };

  if (loading && loads.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading loads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const sortedLoads = sortLoads(loads);

  return (
    <div className="w-full">
      {/* Sort Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 flex items-center gap-2">
            Sort by:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Date">
                <option value="date-newest">Newest First</option>
                <option value="date-oldest">Oldest First</option>
              </optgroup>
              <optgroup label="Distance">
                <option value="distance-shortest">Shortest</option>
                <option value="distance-longest">Longest</option>
              </optgroup>
            </select>
          </label>
        </div>
      </div>

      {/* Loads List - Card View */}
      <div className="space-y-2">
        {sortedLoads.map((load) => {
          const pickup = load.stops[0];
          const delivery = load.stops[load.stops.length - 1];
          const isSelected = selectedLoadId === load.id;
          const pickupCount = getPickupCount(load.stops);
          const deliveryCount = getDeliveryCount(load.stops);
          
          return (
            <div
              key={load.id}
              onClick={() => onLoadSelect(load)}
              className={`relative bg-white rounded-lg border-2 p-3 cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-yellow-400 shadow-lg bg-yellow-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDelete(e, load.id)}
                disabled={deletingId === load.id}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 p-1"
                title="Delete load"
              >
                {deletingId === load.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              <div className="pr-6">
                {/* Header Row - Order ID and Rate */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Order</span>
                    <span className="text-base font-semibold text-gray-900">#{load.orderId || load.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">Rate: </span>
                    <span className="text-sm font-medium text-gray-900">
                      {load.rate ? `$${formatWeight(load.rate)}` : '$ TBD'}
                    </span>
                  </div>
                </div>

                {/* Compact Info Row - Shipper, Route, Equipment */}
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-500">Shipper:</span>
                    <span className="font-medium text-gray-900">{load.company_name || load.customer_id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-500">Route:</span>
                    <span className="font-semibold text-gray-900">
                      {pickup.city.toUpperCase()}, {pickup.state} → {delivery.city.toUpperCase()}, {delivery.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-gray-500">Equipment:</span>
                    <span className="text-gray-900">{load.trailerType} / {load.commodity}</span>
                  </div>
                </div>

                {/* Compact Details Row - Dates, Stops, Distance, Weight */}
                <div className="flex items-center gap-4 text-xs pt-1.5 border-t border-gray-100">
                  <div>
                    <span className="text-gray-500">Dates: </span>
                    <span className="text-gray-900">{formatDate(pickup.earlyArrival)} → {formatDate(delivery.lateArrival)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stops: </span>
                    <span className="text-gray-900">{pickupCount} Pickup → {deliveryCount} Delivery</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Distance: </span>
                    <span className="text-gray-900">{load.miles} mi</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Weight: </span>
                    <span className="text-gray-900">{formatWeight(load.weight)} lbs</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700 flex items-center gap-2">
            Rows per page:
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>
          <span className="text-sm text-gray-700">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} loads
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &lt;
          </button>
          <span className="text-sm text-gray-700 px-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
