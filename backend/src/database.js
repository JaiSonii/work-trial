const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Create in-memory SQLite database
const db = new sqlite3.Database(':memory:');

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbExec = promisify(db.exec.bind(db));

// Initialize database
let dbInitialized = false;

const initializeDatabase = async () => {
  if (dbInitialized) return;
  
  // Create customers table first
  await dbExec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      legal_name TEXT NOT NULL,
      mc_number TEXT,
      dot_number TEXT,
      taxid TEXT,
      primary_contact_name TEXT NOT NULL,
      primary_contact_title TEXT,
      primary_contact_phone TEXT NOT NULL,
      primary_contact_email TEXT NOT NULL
    )
  `);
  
  // Create loads table with foreign key reference to customers
  await dbExec(`
    CREATE TABLE IF NOT EXISTS loads (
      id TEXT PRIMARY KEY,
      orderId TEXT UNIQUE NOT NULL,
      stops TEXT NOT NULL,
      weight REAL NOT NULL,
      trailerType TEXT NOT NULL,
      miles REAL NOT NULL,
      commodity TEXT NOT NULL,
      rate REAL NOT NULL,
      quote_price REAL,
      customer_id TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  
  // Create charges table
  await dbExec(`
    CREATE TABLE IF NOT EXISTS charges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      load_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      charge_type TEXT NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (load_id) REFERENCES loads(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);
  
  dbInitialized = true;
};

// Demo data
const initializeDemoData = async () => {
  await initializeDatabase();
  
  // Demo customers
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

  // Insert demo customers
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

  // Insert demo data
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

// Initialize demo data on module load
initializeDemoData().catch(err => {
  console.error('Error initializing demo data:', err);
});

// Helper function to convert database row to load object
const rowToLoad = (row) => {
  return {
    id: row.id,
    orderId: row.orderId,
    stops: JSON.parse(row.stops),
    weight: row.weight,
    trailerType: row.trailerType,
    miles: row.miles,
    commodity: row.commodity,
    rate: row.rate,
    quote_price: row.quote_price || null,
    customer_id: row.customer_id,
    company_name: row.company_name || null
  };
};

// Database operations
const getAllLoads = async (page = 1, limit = 10, filters = {}) => {
  await initializeDatabase();
  const offset = (page - 1) * limit;
  
  let whereConditions = [];
  let params = [];
  
  // Search filter (customer name, load ID, source/destination)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    whereConditions.push(`(
      l.id LIKE ? OR 
      l.orderId LIKE ? OR 
      c.company_name LIKE ? OR
      l.stops LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Pickup city/state filter
  if (filters.pickupCity) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"city":"${filters.pickupCity}"%`);
  }
  if (filters.pickupState) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"state":"${filters.pickupState}"%`);
  }
  
  // Delivery city/state filter
  if (filters.deliveryCity) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"city":"${filters.deliveryCity}"%`);
  }
  if (filters.deliveryState) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"state":"${filters.deliveryState}"%`);
  }
  
  // Equipment type filter
  if (filters.equipmentType && filters.equipmentType !== 'All') {
    whereConditions.push(`l.trailerType = ?`);
    params.push(filters.equipmentType);
  }
  
  // Stops filter - count array elements in JSON by counting "type" occurrences
  if (filters.stops && filters.stops !== 'All') {
    const stopCount = filters.stops === '2 Stops' ? 2 :
                     filters.stops === '3 Stops' ? 3 :
                     filters.stops === '4 Stops' ? 4 : 5;
    
    // Count occurrences of '"type":' in the JSON string (each stop has a type field)
    // This is more reliable than counting just "type"
    if (filters.stops === '5+ Stops') {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') >= ?`);
      params.push(5);
    } else {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') = ?`);
      params.push(stopCount);
    }
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  const query = `
    SELECT l.*, c.company_name 
    FROM loads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
    ORDER BY l.orderId DESC
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  const rows = await dbAll(query, params);
  
  return rows.map(rowToLoad);
};

const getLoadsCount = async (filters = {}) => {
  await initializeDatabase();
  
  let whereConditions = [];
  let params = [];
  
  // Apply same filters as getAllLoads
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    whereConditions.push(`(
      l.id LIKE ? OR 
      l.orderId LIKE ? OR 
      c.company_name LIKE ? OR
      l.stops LIKE ?
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (filters.pickupCity) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"city":"${filters.pickupCity}"%`);
  }
  if (filters.pickupState) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"state":"${filters.pickupState}"%`);
  }
  
  if (filters.deliveryCity) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"city":"${filters.deliveryCity}"%`);
  }
  if (filters.deliveryState) {
    whereConditions.push(`l.stops LIKE ?`);
    params.push(`%"state":"${filters.deliveryState}"%`);
  }
  
  if (filters.equipmentType && filters.equipmentType !== 'All') {
    whereConditions.push(`l.trailerType = ?`);
    params.push(filters.equipmentType);
  }
  
  if (filters.stops && filters.stops !== 'All') {
    const stopCount = filters.stops === '2 Stops' ? 2 :
                     filters.stops === '3 Stops' ? 3 :
                     filters.stops === '4 Stops' ? 4 : 5;
    
    // Count occurrences of '"type":' in the JSON string (each stop has a type field)
    if (filters.stops === '5+ Stops') {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') >= ?`);
      params.push(5);
    } else {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') = ?`);
      params.push(stopCount);
    }
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  const query = `
    SELECT COUNT(*) as count
    FROM loads l
    LEFT JOIN customers c ON l.customer_id = c.id
    ${whereClause}
  `;
  
  const result = await dbGet(query, params);
  return result?.count || 0;
};

const getLoadById = async (id) => {
  await initializeDatabase();
  const row = await dbGet(`
    SELECT l.*, c.company_name 
    FROM loads l
    LEFT JOIN customers c ON l.customer_id = c.id
    WHERE l.id = ?
  `, [id]);
  return row ? rowToLoad(row) : null;
};

const getNextOrderId = async () => {
  await initializeDatabase();
  const result = await dbGet(
    'SELECT MAX(CAST(SUBSTR(orderId, 5) AS INTEGER)) as maxOrder FROM loads WHERE orderId LIKE "ORD-%"'
  );
  const maxOrder = result?.maxOrder || 0;
  return `ORD-${String(maxOrder + 1).padStart(4, '0')}`;
};

const createLoad = async (load) => {
  await initializeDatabase();
  const id = load.id || String(Date.now());
  const orderId = load.orderId || await getNextOrderId();
  
  await dbRun(
    `INSERT INTO loads (id, orderId, stops, weight, trailerType, miles, commodity, rate, customer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderId,
      JSON.stringify(load.stops || []),
      load.weight,
      load.trailerType,
      load.miles,
      load.commodity,
      load.rate || 0,
      load.customer_id
    ]
  );

  return await getLoadById(id);
};

const updateLoad = async (id, updatedLoad) => {
  await initializeDatabase();
  const existingLoad = await getLoadById(id);
  if (!existingLoad) {
    return null;
  }

  // Merge existing load with updates
  const mergedLoad = {
    ...existingLoad,
    ...updatedLoad,
    id: existingLoad.id // Preserve the original id
  };

  // If stops are being updated, stringify them
  if (updatedLoad.stops) {
    mergedLoad.stops = updatedLoad.stops;
  }

  await dbRun(
    `UPDATE loads
     SET stops = ?,
         weight = ?,
         trailerType = ?,
         miles = ?,
         commodity = ?,
         rate = ?,
         customer_id = ?
     WHERE id = ?`,
    [
      JSON.stringify(mergedLoad.stops),
      mergedLoad.weight,
      mergedLoad.trailerType,
      mergedLoad.miles,
      mergedLoad.commodity,
      mergedLoad.rate || existingLoad.rate,
      mergedLoad.customer_id,
      id
    ]
  );

  return await getLoadById(id);
};

const deleteLoad = async (id) => {
  await initializeDatabase();
  const load = await getLoadById(id);
  if (!load) {
    return null;
  }

  await dbRun('DELETE FROM loads WHERE id = ?', [id]);
  return load;
};

const getNextId = async () => {
  await initializeDatabase();
  const result = await dbGet(
    'SELECT MAX(CAST(id AS INTEGER)) as maxId FROM loads WHERE id GLOB "[0-9]*"'
  );
  const maxId = result?.maxId || 0;
  return String(maxId + 1);
};

const getCustomerById = async (id) => {
  await initializeDatabase();
  const row = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);
  return row || null;
};

const getAllCustomers = async () => {
  await initializeDatabase();
  const rows = await dbAll('SELECT id, company_name FROM customers ORDER BY company_name');
  return rows;
};

const getLaneHistory = async (loadId) => {
  await initializeDatabase();
  
  // Get the current load to find its origin and destination
  const currentLoad = await getLoadById(loadId);
  if (!currentLoad || currentLoad.stops.length < 2) {
    return [];
  }
  
  const pickup = currentLoad.stops[0];
  const delivery = currentLoad.stops[currentLoad.stops.length - 1];
  
  // Create a key for the lane (origin city/state to destination city/state)
  const originKey = `${pickup.city}, ${pickup.state}`;
  const destKey = `${delivery.city}, ${delivery.state}`;
  
  // Get all loads and filter for same lane
  const allLoads = await dbAll(`
    SELECT l.*, c.company_name 
    FROM loads l
    LEFT JOIN customers c ON l.customer_id = c.id
    WHERE l.id != ?
  `, [loadId]);
  
  const laneLoads = allLoads
    .map(rowToLoad)
    .filter(load => {
      if (load.stops.length < 2) return false;
      const loadPickup = load.stops[0];
      const loadDelivery = load.stops[load.stops.length - 1];
      const loadOriginKey = `${loadPickup.city}, ${loadPickup.state}`;
      const loadDestKey = `${loadDelivery.city}, ${loadDelivery.state}`;
      return loadOriginKey === originKey && loadDestKey === destKey;
    })
    .map(load => ({
      id: load.id,
      orderId: load.orderId,
      origin: `${load.stops[0].city}, ${load.stops[0].state}`,
      destination: `${load.stops[load.stops.length - 1].city}, ${load.stops[load.stops.length - 1].state}`,
      trailerType: load.trailerType,
      rate: load.rate,
      company_name: load.company_name
    }))
    .sort((a, b) => new Date(b.orderId) - new Date(a.orderId)); // Sort by orderId descending
  
  return laneLoads;
};

const saveQuote = async (loadId, customerId, quotePrice, accessorialCharges) => {
  await initializeDatabase();
  
  // Update load with quote price
  await dbRun(
    'UPDATE loads SET quote_price = ? WHERE id = ?',
    [quotePrice, loadId]
  );
  
  // Delete existing charges for this load
  await dbRun('DELETE FROM charges WHERE load_id = ?', [loadId]);
  
  // Insert new charges
  if (accessorialCharges && accessorialCharges.length > 0) {
    const insertCharge = db.prepare(`
      INSERT INTO charges (load_id, customer_id, charge_type, amount)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const charge of accessorialCharges) {
      await new Promise((resolve, reject) => {
        insertCharge.run(
          loadId,
          customerId,
          charge.chargeType,
          charge.amount,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    insertCharge.finalize();
  }
  
  return await getLoadById(loadId);
};

const getChargesByLoadId = async (loadId) => {
  await initializeDatabase();
  const rows = await dbAll('SELECT * FROM charges WHERE load_id = ?', [loadId]);
  return rows;
};

module.exports = {
  getAllLoads,
  getLoadsCount,
  getLoadById,
  getCustomerById,
  getAllCustomers,
  getLaneHistory,
  createLoad,
  updateLoad,
  deleteLoad,
  saveQuote,
  getChargesByLoadId,
  getNextId,
  getNextOrderId,
  initializeDemoData
};
