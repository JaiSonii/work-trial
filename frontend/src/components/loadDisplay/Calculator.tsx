'use client';

import { useState } from 'react';

interface Stop {
  type: string;
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

interface AccessorialCharge {
  id: string;
  chargeType: string;
  amount: number;
}

interface CalculatorProps {
  load: Load;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ACCESSORIAL_CHARGE_TYPES = [
  'Detention',
  'Layover',
  'Stop-off',
  'Reconsignment',
  'Fuel Surcharge',
  'Tarping',
  'Loading/Unloading',
  'Inside Delivery',
  'Residential Delivery',
  'Liftgate',
  'Driver Assist',
  'Overweight/Oversized',
  'Hazmat',
  'Temperature Control',
  'Lumper Fee',
  'Scale Ticket',
  'Toll Charges',
  'Permit Fee',
  'Escort Service',
  'Other'
];

export default function Calculator({ load }: CalculatorProps) {
  const [baseCost, setBaseCost] = useState('');
  const [miles, setMiles] = useState(load.miles.toString());
  const [accessorialCharges, setAccessorialCharges] = useState<AccessorialCharge[]>([]);
  const [marginPercentage, setMarginPercentage] = useState('');
  const [loading, setLoading] = useState(false);

  const addAccessorialCharge = () => {
    setAccessorialCharges([
      ...accessorialCharges,
      {
        id: Date.now().toString(),
        chargeType: '',
        amount: 0
      }
    ]);
  };

  const removeAccessorialCharge = (id: string) => {
    setAccessorialCharges(accessorialCharges.filter(charge => charge.id !== id));
  };

  const updateAccessorialCharge = (id: string, field: 'chargeType' | 'amount', value: string | number) => {
    setAccessorialCharges(
      accessorialCharges.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    );
  };

  const calculateSubtotal = () => {
    const base = parseFloat(baseCost) || 0;
    const accessorialTotal = accessorialCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    return base + accessorialTotal;
  };

  const calculateFinalQuote = () => {
    const subtotal = calculateSubtotal();
    const margin = parseFloat(marginPercentage) || 0;
    const marginAmount = (subtotal * margin) / 100;
    return subtotal + marginAmount;
  };

  const handleSubmit = async () => {
    if (!baseCost || !miles) {
      alert('Please enter base cost and miles');
      return;
    }

    setLoading(true);
    try {
      const subtotal = calculateSubtotal();
      const finalQuote = calculateFinalQuote();

      const payload = {
        baseCost: parseFloat(baseCost),
        miles: parseFloat(miles),
        accessorialCharges: accessorialCharges.filter(charge => charge.chargeType && charge.amount > 0),
        marginPercentage: parseFloat(marginPercentage) || 0,
        subtotal,
        finalQuote
      };

      const response = await fetch(`${API_URL}/api/loads/${load.id}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Quote calculated and saved successfully!');
        // Optionally refresh the load data
        window.location.reload();
      } else {
        alert('Error saving quote: ' + data.message);
      }
    } catch (err) {
      console.error('Error calculating quote:', err);
      alert('Error calculating quote');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Quote Calculator</h3>

      {/* Base Cost and Miles */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Base Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Base Cost ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={baseCost}
              onChange={(e) => setBaseCost(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Miles *
            </label>
            <input
              type="number"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Accessorial Charges */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Accessorial Charges</h4>
          <button
            type="button"
            onClick={addAccessorialCharge}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Charge
          </button>
        </div>

        {accessorialCharges.length === 0 ? (
          <p className="text-xs text-gray-500 py-2">No accessorial charges added</p>
        ) : (
          <div className="space-y-2">
            {accessorialCharges.map((charge) => (
              <div key={charge.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Charge Type
                  </label>
                  <select
                    value={charge.chargeType}
                    onChange={(e) => updateAccessorialCharge(charge.id, 'chargeType', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select Type</option>
                    {ACCESSORIAL_CHARGE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={charge.amount || ''}
                    onChange={(e) => updateAccessorialCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAccessorialCharge(charge.id)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Margin */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Margin</h4>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Margin Percentage (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={marginPercentage}
            onChange={(e) => setMarginPercentage(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Quote Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Quote Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Cost:</span>
            <span className="text-gray-900 font-medium">{formatCurrency(parseFloat(baseCost) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Accessorial Charges:</span>
            <span className="text-gray-900 font-medium">
              {formatCurrency(accessorialCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0))}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-blue-200">
            <span className="text-gray-700 font-medium">Subtotal:</span>
            <span className="text-gray-900 font-semibold">{formatCurrency(calculateSubtotal())}</span>
          </div>
          {marginPercentage && (
            <div className="flex justify-between">
              <span className="text-gray-600">Margin ({marginPercentage}%):</span>
              <span className="text-gray-900 font-medium">
                {formatCurrency((calculateSubtotal() * parseFloat(marginPercentage || '0')) / 100)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t-2 border-blue-300">
            <span className="text-gray-900 font-bold">Final Quote Price:</span>
            <span className="text-blue-600 font-bold text-lg">{formatCurrency(calculateFinalQuote())}</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !baseCost || !miles}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save Quote'}
      </button>
    </div>
  );
}
