'use client';

import { useState, useEffect } from 'react';
import Input from './ui/Input';
import Select from './ui/Select';

interface Stop {
  type: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  earlyArrival: string;
  lateArrival: string;
}

interface Customer {
  id: string;
  company_name: string;
}

interface CreateLoadProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCreated: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TRAILER_TYPES = [
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

export default function CreateLoad({ isOpen, onClose, onLoadCreated }: CreateLoadProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    trailerType: '',
    stops: [
      {
        type: 'pickup',
        locationName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        earlyArrival: '',
        lateArrival: ''
      },
      {
        type: 'delivery',
        locationName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        earlyArrival: '',
        lateArrival: ''
      }
    ] as Stop[],
    weight: '',
    miles: '',
    rate: '',
    commodity: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customers`);
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleStopChange = (index: number, field: string, value: string) => {
    const newStops = [...formData.stops];
    (newStops[index] as any)[field] = value;
    setFormData({ ...formData, stops: newStops });
  };

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [
        ...formData.stops.slice(0, -1),
        {
          type: 'pickup', // Default to pickup for intermediate stops
          locationName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          earlyArrival: '',
          lateArrival: ''
        },
        formData.stops[formData.stops.length - 1]
      ]
    });
  };

  const removeStop = (index: number) => {
    if (formData.stops.length <= 2) return;
    if (index === 0 || index === formData.stops.length - 1) return;
    
    const newStops = formData.stops.filter((_, i) => i !== index);
    setFormData({ ...formData, stops: newStops });
  };

  const clearAllFields = () => {
    if (!confirm('Are you sure you want to clear all fields?')) return;
    
    setFormData({
      customer_id: '',
      trailerType: '',
      stops: [
        {
          type: 'pickup',
          locationName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          earlyArrival: '',
          lateArrival: ''
        },
        {
          type: 'delivery',
          locationName: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          earlyArrival: '',
          lateArrival: ''
        }
      ],
      weight: '',
      miles: '',
      rate: '',
      commodity: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation: Ensure first stop is pickup and last is delivery
      if (formData.stops[0].type !== 'pickup') {
        alert('First stop must be a pickup');
        setLoading(false);
        return;
      }
      
      if (formData.stops[formData.stops.length - 1].type !== 'delivery') {
        alert('Last stop must be a delivery');
        setLoading(false);
        return;
      }

      const payload = {
        customer_id: formData.customer_id,
        trailerType: formData.trailerType,
        stops: formData.stops.map(stop => ({
          type: stop.type,
          locationName: stop.locationName,
          address: stop.address,
          city: stop.city,
          state: stop.state,
          zipCode: stop.zipCode,
          earlyArrival: stop.earlyArrival,
          lateArrival: stop.lateArrival
        })),
        weight: parseFloat(formData.weight),
        miles: parseFloat(formData.miles),
        rate: parseFloat(formData.rate) || 0,
        commodity: formData.commodity,
        notes: formData.notes || null
      };

      const response = await fetch(`${API_URL}/api/loads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        onLoadCreated();
        onClose();
        // Reset form
        setFormData({
          customer_id: '',
          trailerType: '',
          stops: [
            {
              type: 'pickup',
              locationName: '',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              earlyArrival: '',
              lateArrival: ''
            },
            {
              type: 'delivery',
              locationName: '',
              address: '',
              city: '',
              state: '',
              zipCode: '',
              earlyArrival: '',
              lateArrival: ''
            }
          ],
          weight: '',
          miles: '',
          rate: '',
          commodity: '',
          notes: ''
        });
      } else {
        alert('Error creating load: ' + data.message);
      }
    } catch (err) {
      console.error('Error creating load:', err);
      alert('Error creating load');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-900">Create New Load</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearAllFields}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Customer and Equipment */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Customer *"
              required
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              placeholder="Select Customer"
              options={customers.map(customer => ({
                value: customer.id,
                label: customer.company_name
              }))}
            />

            <Select
              label="Equipment Type *"
              required
              value={formData.trailerType}
              onChange={(e) => setFormData({ ...formData, trailerType: e.target.value })}
              placeholder="Select Equipment Type"
              options={TRAILER_TYPES.map(type => ({
                value: type,
                label: type
              }))}
            />
          </div>

          {/* Stops */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-semibold text-gray-900">Stops</h3>
              <button
                type="button"
                onClick={addStop}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                + Add Stop
              </button>
            </div>

            <div className="space-y-2">
              {formData.stops.map((stop, index) => {
                const isFirstStop = index === 0;
                const isLastStop = index === formData.stops.length - 1;
                const isIntermediate = !isFirstStop && !isLastStop;
                
                return (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        stop.type === 'pickup' ? 'bg-green-100 text-green-800' :
                        stop.type === 'delivery' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {isFirstStop ? 'Pickup' : 
                         isLastStop ? 'Delivery' :
                         stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
                      </span>
                      {isIntermediate && (
                        <Select
                          value={stop.type}
                          onChange={(e) => handleStopChange(index, 'type', e.target.value)}
                          placeholder="Type"
                          options={[
                            { value: 'pickup', label: 'Pickup' },
                            { value: 'delivery', label: 'Delivery' }
                          ]}
                          className="text-xs w-24"
                        />
                      )}
                    </div>
                    {isIntermediate && (
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Input
                        label="Location Name *"
                        type="text"
                        required
                        value={stop.locationName}
                        onChange={(e) => handleStopChange(index, 'locationName', e.target.value)}
                        placeholder="Warehouse, Distribution Center, etc."
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        label="Address *"
                        type="text"
                        required
                        value={stop.address}
                        onChange={(e) => handleStopChange(index, 'address', e.target.value)}
                        placeholder="Street address"
                      />
                    </div>

                    <Input
                      label="City *"
                      type="text"
                      required
                      value={stop.city}
                      onChange={(e) => handleStopChange(index, 'city', e.target.value)}
                      placeholder="City name"
                    />

                    <Input
                      label="State *"
                      type="text"
                      required
                      maxLength={2}
                      value={stop.state}
                      onChange={(e) => handleStopChange(index, 'state', e.target.value.toUpperCase())}
                      placeholder="CA"
                    />

                    <Input
                      label="Zip Code *"
                      type="text"
                      required
                      value={stop.zipCode}
                      onChange={(e) => handleStopChange(index, 'zipCode', e.target.value)}
                      placeholder="12345"
                    />

                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <Input
                        label="Early Arrival *"
                        type="datetime-local"
                        required
                        value={stop.earlyArrival ? new Date(stop.earlyArrival).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleStopChange(index, 'earlyArrival', new Date(e.target.value).toISOString())}
                      />

                      <Input
                        label="Late Arrival *"
                        type="datetime-local"
                        required
                        value={stop.lateArrival ? new Date(stop.lateArrival).toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleStopChange(index, 'lateArrival', new Date(e.target.value).toISOString())}
                      />
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Shipment Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Shipment Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Weight (lbs) *"
                type="number"
                required
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Enter weight"
                min="0"
              />
              <Input
                label="Miles *"
                type="number"
                required
                value={formData.miles}
                onChange={(e) => setFormData({ ...formData, miles: e.target.value })}
                placeholder="Enter miles"
                min="0"
              />
              <Input
                label="Rate ($)"
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                placeholder="Enter rate"
                min="0"
                step="0.01"
              />
              <Input
                label="Commodity *"
                type="text"
                required
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                placeholder="Enter commodity type"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes or comments about this load..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Load'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

