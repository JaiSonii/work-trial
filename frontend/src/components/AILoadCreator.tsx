'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ParsedLoadData {
  customer?: string;
  equipmentType?: string;
  pickup?: {
    locationName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    earlyArrival?: string;
    lateArrival?: string;
  };
  delivery?: {
    locationName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    earlyArrival?: string;
    lateArrival?: string;
  };
  weight?: number;
  miles?: number;
  rate?: number;
  commodity?: string;
}

interface AILoadCreatorProps {
  isOpen: boolean;
  onClose?: () => void;
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

// Mock AI service to parse natural language
const mockAIParse = async (userInput: string, existingData: ParsedLoadData): Promise<{ message: string; data: ParsedLoadData; isComplete: boolean }> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  const input = userInput.toLowerCase();
  const updatedData = { ...existingData };

  // Extract customer name
  if (!updatedData.customer) {
    const customerMatch = input.match(/(?:customer|client|for)\s+([a-z\s]+?)(?:\s+(?:pickup|delivery|from|to|with|using|weight|miles|rate|commodity)|$)/i);
    if (customerMatch) {
      updatedData.customer = customerMatch[1].trim();
    }
  }

  // Extract equipment type
  if (!updatedData.equipmentType) {
    for (const type of TRAILER_TYPES) {
      if (input.includes(type.toLowerCase())) {
        updatedData.equipmentType = type;
        break;
      }
    }
  }

  // Extract pickup information
  if (!updatedData.pickup) {
    updatedData.pickup = {};
  }
  const pickupMatch = input.match(/(?:pickup|pick up|from|origin)\s+(?:at|from)?\s*([^,]+?)(?:,|to|delivery|$)/i);
  if (pickupMatch && !updatedData.pickup.city) {
    const location = pickupMatch[1].trim();
    const cityStateMatch = location.match(/([^,]+?),\s*([A-Z]{2})/);
    if (cityStateMatch) {
      updatedData.pickup.city = cityStateMatch[1].trim();
      updatedData.pickup.state = cityStateMatch[2].trim();
    } else {
      updatedData.pickup.city = location;
    }
  }

  // Extract delivery information
  if (!updatedData.delivery) {
    updatedData.delivery = {};
  }
  const deliveryMatch = input.match(/(?:delivery|deliver|to|destination)\s+(?:at|to)?\s*([^,]+?)(?:,|with|weight|miles|rate|commodity|$)/i);
  if (deliveryMatch && !updatedData.delivery.city) {
    const location = deliveryMatch[1].trim();
    const cityStateMatch = location.match(/([^,]+?),\s*([A-Z]{2})/);
    if (cityStateMatch) {
      updatedData.delivery.city = cityStateMatch[1].trim();
      updatedData.delivery.state = cityStateMatch[2].trim();
    } else {
      updatedData.delivery.city = location;
    }
  }

  // Extract weight
  const weightMatch = input.match(/(?:weight|weighs?)\s*(?:is|of|:)?\s*([\d,]+)\s*(?:lbs?|pounds?|lb)?/i);
  if (weightMatch && !updatedData.weight) {
    updatedData.weight = parseFloat(weightMatch[1].replace(/,/g, ''));
  }

  // Extract miles
  const milesMatch = input.match(/(?:miles?|distance)\s*(?:is|of|:)?\s*([\d,]+)\s*(?:miles?|mi)?/i);
  if (milesMatch && !updatedData.miles) {
    updatedData.miles = parseFloat(milesMatch[1].replace(/,/g, ''));
  }

  // Extract rate
  const rateMatch = input.match(/(?:rate|price|cost)\s*(?:is|of|:)?\s*\$?([\d,]+(?:\.[\d]{2})?)/i);
  if (rateMatch && !updatedData.rate) {
    updatedData.rate = parseFloat(rateMatch[1].replace(/,/g, ''));
  }

  // Extract commodity
  const commodityMatch = input.match(/(?:commodity|product|goods?)\s*(?:is|:)?\s*([^,]+?)(?:\s+(?:pickup|delivery|weight|miles|rate|$))/i);
  if (commodityMatch && !updatedData.commodity) {
    updatedData.commodity = commodityMatch[1].trim();
  }

  // Determine what's missing and ask questions
  const missingFields: string[] = [];
  if (!updatedData.customer) missingFields.push('customer');
  if (!updatedData.equipmentType) missingFields.push('equipment type');
  if (!updatedData.pickup?.city) missingFields.push('pickup location');
  if (!updatedData.delivery?.city) missingFields.push('delivery location');
  if (!updatedData.weight) missingFields.push('weight');
  if (!updatedData.miles) missingFields.push('miles');
  if (!updatedData.commodity) missingFields.push('commodity');

  let message = '';
  if (missingFields.length === 0) {
    message = `Perfect! I've extracted all the information. Here's what I found:\n\n` +
      `• Customer: ${updatedData.customer}\n` +
      `• Equipment: ${updatedData.equipmentType}\n` +
      `• Pickup: ${updatedData.pickup.city}${updatedData.pickup.state ? ', ' + updatedData.pickup.state : ''}\n` +
      `• Delivery: ${updatedData.delivery.city}${updatedData.delivery.state ? ', ' + updatedData.delivery.state : ''}\n` +
      `• Weight: ${updatedData.weight?.toLocaleString()} lbs\n` +
      `• Miles: ${updatedData.miles?.toLocaleString()}\n` +
      `• Rate: $${updatedData.rate?.toLocaleString()}\n` +
      `• Commodity: ${updatedData.commodity}\n\n` +
      `Would you like me to create this load? Type "yes" or "confirm" to proceed.`;
  } else if (missingFields.length === 1) {
    message = `I need one more piece of information: ${missingFields[0]}. Can you provide that?`;
  } else {
    message = `I still need a few more details: ${missingFields.slice(0, -1).join(', ')}, and ${missingFields[missingFields.length - 1]}. Can you provide these?`;
  }

  return {
    message,
    data: updatedData,
    isComplete: missingFields.length === 0
  };
};

export default function AILoadCreator({ isOpen, onClose = () => {}, onLoadCreated }: AILoadCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI load creation assistant. I can help you create loads using natural language. Just tell me about the load you want to create, and I\'ll extract the information and ask for any missing details.\n\nFor example, you could say: "Create a load for TechLogistics from Los Angeles, CA to San Francisco, CA using a Dry Van, weight 15000 lbs, 380 miles, rate $2850, commodity Electronics"',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedLoadData>({});
  const [customers, setCustomers] = useState<Array<{ id: string; company_name: string }>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setInput('');
    addMessage('user', userInput);

    // Check if user is confirming (only if we have all required data)
    const hasAllData = parsedData.customer && 
                      parsedData.equipmentType && 
                      parsedData.pickup?.city && 
                      parsedData.delivery?.city &&
                      parsedData.weight &&
                      parsedData.miles &&
                      parsedData.commodity;
    
    if (hasAllData && userInput.toLowerCase().match(/^(yes|confirm|create|proceed|go ahead)$/i)) {
      await createLoad();
      return;
    }

    setIsProcessing(true);
    try {
      const result = await mockAIParse(userInput, parsedData);
      setParsedData(result.data);
      addMessage('assistant', result.message);
    } catch (error) {
      addMessage('assistant', 'I apologize, but I encountered an error processing your request. Could you please try rephrasing it?');
    } finally {
      setIsProcessing(false);
    }
  };

  const createLoad = async () => {
    setIsCreating(true);
    addMessage('assistant', 'Creating your load now...');

    try {
      // Find customer by name
      const customer = customers.find(c => 
        c.company_name.toLowerCase().includes(parsedData.customer?.toLowerCase() || '') ||
        parsedData.customer?.toLowerCase().includes(c.company_name.toLowerCase() || '')
      );

      if (!customer) {
        addMessage('assistant', `I couldn't find a customer matching "${parsedData.customer}". Please select a customer from the list or provide a valid customer name.`);
        setIsCreating(false);
        return;
      }

      // Generate dates (default to today + 1 day for pickup, +2 days for delivery)
      const today = new Date();
      const pickupDate = new Date(today);
      pickupDate.setDate(pickupDate.getDate() + 1);
      const deliveryDate = new Date(today);
      deliveryDate.setDate(deliveryDate.getDate() + 2);

      const stops = [];
      
      // Pickup stop
      if (parsedData.pickup) {
        stops.push({
          type: 'pickup',
          locationName: parsedData.pickup.locationName || `Pickup Location`,
          address: parsedData.pickup.address || 'Address TBD',
          city: parsedData.pickup.city || '',
          state: parsedData.pickup.state || '',
          zipCode: parsedData.pickup.zipCode || '00000',
          earlyArrival: parsedData.pickup.earlyArrival || pickupDate.toISOString(),
          lateArrival: parsedData.pickup.lateArrival || new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toISOString()
        });
      }

      // Delivery stop
      if (parsedData.delivery) {
        stops.push({
          type: 'delivery',
          locationName: parsedData.delivery.locationName || `Delivery Location`,
          address: parsedData.delivery.address || 'Address TBD',
          city: parsedData.delivery.city || '',
          state: parsedData.delivery.state || '',
          zipCode: parsedData.delivery.zipCode || '00000',
          earlyArrival: parsedData.delivery.earlyArrival || deliveryDate.toISOString(),
          lateArrival: parsedData.delivery.lateArrival || new Date(deliveryDate.getTime() + 2 * 60 * 60 * 1000).toISOString()
        });
      }

      const payload = {
        customer_id: customer.id,
        trailerType: parsedData.equipmentType || 'Dry Van',
        stops,
        weight: parsedData.weight || 0,
        miles: parsedData.miles || 0,
        rate: parsedData.rate || 0,
        commodity: parsedData.commodity || 'General Freight'
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
        addMessage('assistant', `✅ Load created successfully! Order ID: ${data.data.orderId}\n\nThe load has been added to your system. You can view it in the loads list.`);
        setTimeout(() => {
          onLoadCreated();
          onClose();
        }, 2000);
      } else {
        addMessage('assistant', `❌ Error creating load: ${data.message}. Please try again or use the manual form.`);
        setIsCreating(false);
      }
    } catch (error) {
      addMessage('assistant', '❌ An error occurred while creating the load. Please try again or use the manual form.');
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Load Creator</h2>
              <p className="text-sm text-blue-100">Natural language load creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm text-gray-600 ml-2">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your load details here... (e.g., 'Create a load for TechLogistics from LA to SF using Dry Van')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing || isCreating}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing || isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Describe your load naturally. The AI will ask for any missing information.
          </p>
        </div>
      </div>
    </div>
  );
}

