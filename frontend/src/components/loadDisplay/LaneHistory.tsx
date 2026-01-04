'use client';

import { useState, useEffect } from 'react';

interface LaneHistoryItem {
  id: string;
  orderId: string;
  origin: string;
  destination: string;
  trailerType: string;
  rate: number;
  company_name?: string;
}

interface LaneHistoryProps {
  loadId: string;
  currentLoad?: {
    origin: string;
    destination: string;
    trailerType: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LaneHistory({ loadId, currentLoad }: LaneHistoryProps) {
  const [laneHistory, setLaneHistory] = useState<LaneHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadId) {
      fetchLaneHistory();
    }
  }, [loadId]);

  const fetchLaneHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/loads/${loadId}/lane-history`);
      const data = await response.json();
      
      if (data.success) {
        setLaneHistory(data.data);
      } else {
        setError(data.message || 'Failed to fetch lane history');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lane history...</div>
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

  if (laneHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Lane History</h3>
          <span className="text-sm text-gray-500">No history found</span>
        </div>
        
        {currentLoad && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-3">Current Load:</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Origin:</span>
                <span className="text-gray-900 font-medium">{currentLoad.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="text-gray-900 font-medium">{currentLoad.destination}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Equipment Type:</span>
                <span className="text-gray-900 font-medium">{currentLoad.trailerType}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
              No other loads found with the same origin and destination
            </p>
          </div>
        )}
        
        {!currentLoad && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No lane history found</p>
            <p className="text-sm text-gray-400 mt-2">No other loads found with the same origin and destination</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Lane History</h3>
        <span className="text-sm text-gray-500">{laneHistory.length} load(s) found</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipment Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Load Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {laneHistory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.orderId}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.origin}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.destination}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.trailerType}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatCurrency(item.rate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.company_name || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
