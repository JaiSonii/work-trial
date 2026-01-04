const { db } = require('./connection');
const { initializeDatabase } = require('./schema');

// Demo customers data
const demoCustomers = [
  {
    id: 'CUST001',
    company_name: 'TechLogistics Inc.',
    legal_name: 'TechLogistics Incorporated',
    mc_number: 'MC-123456',
    dot_number: 'DOT-789012',
    taxid: '12-3456789',
    primary_contact_name: 'John Smith',
    primary_contact_title: 'Operations Manager',
    primary_contact_phone: '555-0101',
    primary_contact_email: 'john.smith@techlogistics.com'
  },
  {
    id: 'CUST002',
    company_name: 'FreshFood Transport',
    legal_name: 'FreshFood Transport LLC',
    mc_number: 'MC-234567',
    dot_number: 'DOT-890123',
    taxid: '23-4567890',
    primary_contact_name: 'Sarah Johnson',
    primary_contact_title: 'Logistics Coordinator',
    primary_contact_phone: '555-0202',
    primary_contact_email: 'sarah.johnson@freshfood.com'
  },
  {
    id: 'CUST003',
    company_name: 'BuildRight Materials',
    legal_name: 'BuildRight Materials Corporation',
    mc_number: 'MC-345678',
    dot_number: 'DOT-901234',
    taxid: '34-5678901',
    primary_contact_name: 'Michael Chen',
    primary_contact_title: 'Supply Chain Director',
    primary_contact_phone: '555-0303',
    primary_contact_email: 'michael.chen@buildright.com'
  },
  {
    id: 'CUST004',
    company_name: 'Global Freight Solutions',
    legal_name: 'Global Freight Solutions Inc.',
    mc_number: 'MC-456789',
    dot_number: 'DOT-012345',
    taxid: '45-6789012',
    primary_contact_name: 'Emily Rodriguez',
    primary_contact_title: 'Account Manager',
    primary_contact_phone: '555-0404',
    primary_contact_email: 'emily.rodriguez@globalfreight.com'
  }
];

// Demo loads data
const demoLoads = [
  {
    id: '1',
    orderId: 'ORD-0001',
    stops: [
      {
        type: 'pickup',
        locationName: 'TechLogistics Warehouse',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        earlyArrival: '2024-01-15T07:00:00Z',
        lateArrival: '2024-01-15T09:00:00Z'
      },
      {
        type: 'delivery',
        locationName: 'SF Distribution Center',
        address: '456 Oak Ave',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        earlyArrival: '2024-01-15T13:00:00Z',
        lateArrival: '2024-01-15T15:00:00Z'
      }
    ],
    weight: 15000,
    trailerType: 'Dry Van',
    miles: 380,
    commodity: 'Electronics',
    rate: 2850.00,
    customer_id: 'CUST001'
  },
  {
    id: '2',
    orderId: 'ORD-0002',
    stops: [
      {
        type: 'pickup',
        locationName: 'Dallas Food Terminal',
        address: '789 Commerce Blvd',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        earlyArrival: '2024-01-16T08:00:00Z',
        lateArrival: '2024-01-16T10:00:00Z'
      },
      {
        type: 'intermediate',
        locationName: 'Houston Cold Storage',
        address: '321 Industrial Way',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001',
        earlyArrival: '2024-01-16T14:00:00Z',
        lateArrival: '2024-01-16T16:00:00Z'
      },
      {
        type: 'delivery',
        locationName: 'Austin Retail Hub',
        address: '654 Market St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        earlyArrival: '2024-01-17T09:00:00Z',
        lateArrival: '2024-01-17T11:00:00Z'
      }
    ],
    weight: 22000,
    trailerType: 'Refrigerated',
    miles: 450,
    commodity: 'Food Products',
    rate: 3600.00,
    customer_id: 'CUST002'
  },
  {
    id: '3',
    orderId: 'ORD-0003',
    stops: [
      {
        type: 'pickup',
        locationName: 'Chicago Materials Yard',
        address: '987 Warehouse Rd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        earlyArrival: '2024-01-18T06:00:00Z',
        lateArrival: '2024-01-18T08:00:00Z'
      },
      {
        type: 'delivery',
        locationName: 'Detroit Construction Site',
        address: '147 Distribution Center',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48201',
        earlyArrival: '2024-01-18T15:00:00Z',
        lateArrival: '2024-01-18T17:00:00Z'
      }
    ],
    weight: 18000,
    trailerType: 'Flatbed',
    miles: 280,
    commodity: 'Construction Materials',
    rate: 2240.00,
    customer_id: 'CUST003'
  },
  {
    id: '4',
    orderId: 'ORD-0004',
    stops: [
      {
        type: 'pickup',
        locationName: 'Phoenix Logistics Hub',
        address: '258 Logistics Park',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        earlyArrival: '2024-01-19T07:00:00Z',
        lateArrival: '2024-01-19T09:00:00Z'
      },
      {
        type: 'intermediate',
        locationName: 'Las Vegas Transit Point',
        address: '369 Transit Hub',
        city: 'Las Vegas',
        state: 'NV',
        zipCode: '89101',
        earlyArrival: '2024-01-19T12:00:00Z',
        lateArrival: '2024-01-19T14:00:00Z'
      },
      {
        type: 'intermediate',
        locationName: 'Salt Lake City Terminal',
        address: '741 Freight Terminal',
        city: 'Salt Lake City',
        state: 'UT',
        zipCode: '84101',
        earlyArrival: '2024-01-20T08:00:00Z',
        lateArrival: '2024-01-20T10:00:00Z'
      },
      {
        type: 'delivery',
        locationName: 'Denver Distribution Center',
        address: '852 Shipping Center',
        city: 'Denver',
        state: 'CO',
        zipCode: '80201',
        earlyArrival: '2024-01-20T16:00:00Z',
        lateArrival: '2024-01-20T18:00:00Z'
      }
    ],
    weight: 25000,
    trailerType: 'Dry Van',
    miles: 750,
    commodity: 'General Freight',
    rate: 5625.00,
    customer_id: 'CUST001'
  }
];

// Seed customers
const seedCustomers = async () => {
  const insertCustomer = db.prepare(`
    INSERT INTO customers (
      id, company_name, legal_name, mc_number, dot_number, taxid,
      primary_contact_name, primary_contact_title, primary_contact_phone, primary_contact_email
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const customer of demoCustomers) {
    await new Promise((resolve, reject) => {
      insertCustomer.run(
        customer.id,
        customer.company_name,
        customer.legal_name,
        customer.mc_number,
        customer.dot_number,
        customer.taxid,
        customer.primary_contact_name,
        customer.primary_contact_title,
        customer.primary_contact_phone,
        customer.primary_contact_email,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  insertCustomer.finalize();
};

// Seed loads
const seedLoads = async () => {
  const insert = db.prepare(`
    INSERT INTO loads (id, orderId, stops, weight, trailerType, miles, commodity, rate, customer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const load of demoLoads) {
    await new Promise((resolve, reject) => {
      insert.run(
        load.id,
        load.orderId,
        JSON.stringify(load.stops),
        load.weight,
        load.trailerType,
        load.miles,
        load.commodity,
        load.rate,
        load.customer_id,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  insert.finalize();
};

// Initialize all demo data
const initializeDemoData = async () => {
  await initializeDatabase();
  await seedCustomers();
  await seedLoads();
};

module.exports = {
  initializeDemoData,
  demoCustomers,
  demoLoads
};

