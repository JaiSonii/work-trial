const { db } = require('./connection');
const { initializeDatabase } = require('./schema');

// Demo customers data - 10 customers
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
  },
  {
    id: 'CUST005',
    company_name: 'AutoParts Express',
    legal_name: 'AutoParts Express LLC',
    mc_number: 'MC-567890',
    dot_number: 'DOT-123456',
    taxid: '56-7890123',
    primary_contact_name: 'David Williams',
    primary_contact_title: 'Fleet Manager',
    primary_contact_phone: '555-0505',
    primary_contact_email: 'david.williams@autoparts.com'
  },
  {
    id: 'CUST006',
    company_name: 'ChemTrans Logistics',
    legal_name: 'ChemTrans Logistics Corporation',
    mc_number: 'MC-678901',
    dot_number: 'DOT-234567',
    taxid: '67-8901234',
    primary_contact_name: 'Lisa Anderson',
    primary_contact_title: 'Safety Director',
    primary_contact_phone: '555-0606',
    primary_contact_email: 'lisa.anderson@chemtrans.com'
  },
  {
    id: 'CUST007',
    company_name: 'Retail Distribution Co.',
    legal_name: 'Retail Distribution Company Inc.',
    mc_number: 'MC-789012',
    dot_number: 'DOT-345678',
    taxid: '78-9012345',
    primary_contact_name: 'Robert Taylor',
    primary_contact_title: 'Distribution Manager',
    primary_contact_phone: '555-0707',
    primary_contact_email: 'robert.taylor@retaildist.com'
  },
  {
    id: 'CUST008',
    company_name: 'Agricultural Transport',
    legal_name: 'Agricultural Transport Services LLC',
    mc_number: 'MC-890123',
    dot_number: 'DOT-456789',
    taxid: '89-0123456',
    primary_contact_name: 'Jennifer Martinez',
    primary_contact_title: 'Operations Coordinator',
    primary_contact_phone: '555-0808',
    primary_contact_email: 'jennifer.martinez@agtransport.com'
  },
  {
    id: 'CUST009',
    company_name: 'Furniture Movers Pro',
    legal_name: 'Furniture Movers Professional Inc.',
    mc_number: 'MC-901234',
    dot_number: 'DOT-567890',
    taxid: '90-1234567',
    primary_contact_name: 'James Brown',
    primary_contact_title: 'Customer Service Manager',
    primary_contact_phone: '555-0909',
    primary_contact_email: 'james.brown@furnituremovers.com'
  },
  {
    id: 'CUST010',
    company_name: 'Energy Solutions Transport',
    legal_name: 'Energy Solutions Transport LLC',
    mc_number: 'MC-012345',
    dot_number: 'DOT-678901',
    taxid: '01-2345678',
    primary_contact_name: 'Patricia Davis',
    primary_contact_title: 'Logistics Director',
    primary_contact_phone: '555-1010',
    primary_contact_email: 'patricia.davis@energytransport.com'
  }
];

// Helper function to generate random date within a range
const randomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date;
};

// Helper function to generate arrival dates
const generateArrivalDates = (baseDate, hoursOffset) => {
  const earlyDate = new Date(baseDate);
  earlyDate.setHours(earlyDate.getHours() + hoursOffset);
  const lateDate = new Date(earlyDate);
  lateDate.setHours(lateDate.getHours() + 2);
  return {
    early: earlyDate.toISOString(),
    late: lateDate.toISOString()
  };
};

// Cities and states for generating routes
const cities = [
  { city: 'Los Angeles', state: 'CA' },
  { city: 'San Francisco', state: 'CA' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Sacramento', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Houston', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Detroit', state: 'MI' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Las Vegas', state: 'NV' },
  { city: 'Denver', state: 'CO' },
  { city: 'Salt Lake City', state: 'UT' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Portland', state: 'OR' },
  { city: 'Miami', state: 'FL' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'New York', state: 'NY' },
  { city: 'Boston', state: 'MA' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'Baltimore', state: 'MD' },
  { city: 'Charlotte', state: 'NC' },
  { city: 'Nashville', state: 'TN' },
  { city: 'Memphis', state: 'TN' },
  { city: 'Kansas City', state: 'MO' },
  { city: 'Minneapolis', state: 'MN' },
  { city: 'Milwaukee', state: 'WI' },
  { city: 'Indianapolis', state: 'IN' },
  { city: 'Columbus', state: 'OH' }
];

const trailerTypes = [
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

const commodities = [
  'Electronics',
  'Food Products',
  'Construction Materials',
  'General Freight',
  'Automotive Parts',
  'Furniture',
  'Chemicals',
  'Retail Goods',
  'Agricultural Products',
  'Energy Equipment',
  'Medical Supplies',
  'Textiles',
  'Machinery',
  'Paper Products',
  'Plastics'
];

// Generate 100 loads - 10 per customer
const generateLoads = () => {
  const loads = [];
  const baseDate = new Date('2024-01-15');
  let orderCounter = 1;
  let loadIdCounter = 1;

  // Generate 10 loads for each customer
  for (let customerIndex = 0; customerIndex < 10; customerIndex++) {
    const customerId = `CUST${String(customerIndex + 1).padStart(3, '0')}`;
    
    for (let loadIndex = 0; loadIndex < 10; loadIndex++) {
      // Random route selection
      const originIndex = Math.floor(Math.random() * cities.length);
      let destIndex = Math.floor(Math.random() * cities.length);
      // Ensure destination is different from origin
      while (destIndex === originIndex) {
        destIndex = Math.floor(Math.random() * cities.length);
      }
      
      const origin = cities[originIndex];
      const destination = cities[destIndex];
      
      // Calculate approximate miles (rough estimate)
      const miles = Math.floor(300 + Math.random() * 2000);
      
      // Determine number of stops (2, 3, 4, or 5+)
      let numStops = 2;
      const stopChance = Math.random();
      if (stopChance < 0.5) numStops = 2;
      else if (stopChance < 0.75) numStops = 3;
      else if (stopChance < 0.9) numStops = 4;
      else numStops = 5;
      
      // Generate stops
      const stops = [];
      const loadDate = new Date(baseDate);
      loadDate.setDate(loadDate.getDate() + (customerIndex * 10) + loadIndex);
      
      // Pickup stop
      const pickupDates = generateArrivalDates(loadDate, 7);
      stops.push({
        type: 'pickup',
        locationName: `${origin.city} Warehouse`,
        address: `${Math.floor(Math.random() * 9999) + 1} Industrial Blvd`,
        city: origin.city,
        state: origin.state,
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        earlyArrival: pickupDates.early,
        lateArrival: pickupDates.late
      });
      
      // Intermediate stops (if any)
      for (let i = 0; i < numStops - 2; i++) {
        const intermediateCity = cities[Math.floor(Math.random() * cities.length)];
        const intermediateDates = generateArrivalDates(loadDate, 12 + (i * 6));
        stops.push({
          type: 'intermediate',
          locationName: `${intermediateCity.city} Transit Point`,
          address: `${Math.floor(Math.random() * 9999) + 1} Distribution Way`,
          city: intermediateCity.city,
          state: intermediateCity.state,
          zipCode: String(Math.floor(Math.random() * 90000) + 10000),
          earlyArrival: intermediateDates.early,
          lateArrival: intermediateDates.late
        });
      }
      
      // Delivery stop
      const deliveryDates = generateArrivalDates(loadDate, 12 + ((numStops - 2) * 6));
      stops.push({
        type: 'delivery',
        locationName: `${destination.city} Distribution Center`,
        address: `${Math.floor(Math.random() * 9999) + 1} Shipping Ave`,
        city: destination.city,
        state: destination.state,
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        earlyArrival: deliveryDates.early,
        lateArrival: deliveryDates.late
      });
      
      // Generate load details
      const trailerType = trailerTypes[Math.floor(Math.random() * trailerTypes.length)];
      const commodity = commodities[Math.floor(Math.random() * commodities.length)];
      const weight = Math.floor(10000 + Math.random() * 30000); // 10,000 to 40,000 lbs
      const ratePerMile = 1.5 + Math.random() * 2.5; // $1.50 to $4.00 per mile
      const rate = Math.floor(miles * ratePerMile);
      
      loads.push({
        id: String(loadIdCounter++),
        orderId: `ORD-${String(orderCounter++).padStart(4, '0')}`,
        stops,
        weight,
        trailerType,
        miles,
        commodity,
        rate,
        customer_id: customerId
      });
    }
  }
  
  return loads;
};

const demoLoads = generateLoads();

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
    INSERT INTO loads (id, orderId, stops, weight, trailerType, miles, commodity, rate, notes, customer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        null, // notes - null for seed data
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
