'use client';

import { useState } from 'react';

interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  equipmentType: string;
  stops: string;
}

const EQUIPMENT_TYPES = [
  'All',
  'Dry Van',
  'Refrigerated',
  'Flatbed',
  'Step Deck',
  'Double Drop',
  'Lowboy',
  'Hotshot',
  'Box Truck',
  'Conestoga',
  'Auto Carrier',
  'Tanker',
  'Intermodal'
];

const STOPS_OPTIONS = [
  'All',
  '2 Stops',
  '3 Stops',
  '4 Stops',
  '5+ Stops'
];

export default function Filters({ onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    pickupCity: '',
    pickupState: '',
    deliveryCity: '',
    deliveryState: '',
    equipmentType: 'All',
    stops: 'All'
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      pickupCity: '',
      pickupState: '',
      deliveryCity: '',
      deliveryState: '',
      equipmentType: 'All',
      stops: 'All'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.pickupCity || filters.pickupState || 
    filters.deliveryCity || filters.deliveryState || 
    filters.equipmentType !== 'All' || filters.stops !== 'All';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Active
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Loads</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search (Customer, Load ID, Source/Destination)
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              {/* Pickup Location */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Pickup Location</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={filters.pickupCity}
                      onChange={(e) => handleFilterChange('pickupCity', e.target.value)}
                      placeholder="City"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={filters.pickupState}
                      onChange={(e) => handleFilterChange('pickupState', e.target.value.toUpperCase())}
                      placeholder="State"
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Location */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery Location</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={filters.deliveryCity}
                      onChange={(e) => handleFilterChange('deliveryCity', e.target.value)}
                      placeholder="City"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={filters.deliveryState}
                      onChange={(e) => handleFilterChange('deliveryState', e.target.value.toUpperCase())}
                      placeholder="State"
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Type */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Type
                </label>
                <select
                  value={filters.equipmentType}
                  onChange={(e) => handleFilterChange('equipmentType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                >
                  {EQUIPMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stops */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Stops
                </label>
                <select
                  value={filters.stops}
                  onChange={(e) => handleFilterChange('stops', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black"
                >
                  {STOPS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

