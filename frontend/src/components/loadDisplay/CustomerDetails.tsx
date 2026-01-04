'use client';

interface CustomerDetailsProps {
  customerId: string;
  loading?: boolean;
  customerData?: any;
}

export default function CustomerDetails({ customerId, loading, customerData }: CustomerDetailsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading customer details...</div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No customer data available</div>
      </div>
    );
  }

  const customer = customerData;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Customer ID</label>
          <p className="mt-1 text-sm text-gray-900">{customer.id}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Company Name</label>
          <p className="mt-1 text-sm text-gray-900">{customer.company_name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Legal Name</label>
          <p className="mt-1 text-sm text-gray-900">{customer.legal_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">MC Number</label>
            <p className="mt-1 text-sm text-gray-900">{customer.mc_number || 'N/A'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">DOT Number</label>
            <p className="mt-1 text-sm text-gray-900">{customer.dot_number || 'N/A'}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Tax ID</label>
          <p className="mt-1 text-sm text-gray-900">{customer.taxid || 'N/A'}</p>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Primary Contact</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Name</label>
              <p className="mt-1 text-sm text-gray-900">{customer.primary_contact_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="mt-1 text-sm text-gray-900">{customer.primary_contact_title || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{customer.primary_contact_phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{customer.primary_contact_email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

