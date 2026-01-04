const { dbRun, dbGet, dbAll } = require('./connection');
const { initializeDatabase } = require('./schema');

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
    notes: row.notes || null,
    customer_id: row.customer_id,
    company_name: row.company_name || null
  };
};

// Build filter conditions for loads query
const buildFilterConditions = (filters) => {
  const whereConditions = [];
  const params = [];
  
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
    if (filters.stops === '5+ Stops') {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') >= ?`);
      params.push(5);
    } else {
      whereConditions.push(`(LENGTH(l.stops) - LENGTH(REPLACE(l.stops, '"type":', ''))) / LENGTH('"type":') = ?`);
      params.push(stopCount);
    }
  }
  
  return { whereConditions, params };
};

// Get all loads with pagination and filtering
const getAllLoads = async (page = 1, limit = 10, filters = {}) => {
  await initializeDatabase();
  const offset = (page - 1) * limit;
  
  const { whereConditions, params } = buildFilterConditions(filters);
  
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

// Get loads count with filtering
const getLoadsCount = async (filters = {}) => {
  await initializeDatabase();
  
  const { whereConditions, params } = buildFilterConditions(filters);
  
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

// Get load by ID
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

// Create a new load
const getNextOrderId = async () => {
  await initializeDatabase();
  const result = await dbGet(
    'SELECT MAX(CAST(SUBSTR(orderId, 5) AS INTEGER)) as maxOrder FROM loads WHERE orderId LIKE "ORD-%"'
  );
  const maxOrder = result?.maxOrder || 0;
  return `ORD-${String(maxOrder + 1).padStart(4, '0')}`;
};

const getNextId = async () => {
  await initializeDatabase();
  const result = await dbGet(
    'SELECT MAX(CAST(id AS INTEGER)) as maxId FROM loads WHERE id GLOB "[0-9]*"'
  );
  const maxId = result?.maxId || 0;
  return String(maxId + 1);
};

const createLoad = async (load) => {
  await initializeDatabase();
  const id = load.id || String(Date.now());
  const orderId = load.orderId || await getNextOrderId();
  
  await dbRun(
    `INSERT INTO loads (id, orderId, stops, weight, trailerType, miles, commodity, rate, notes, customer_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      orderId,
      JSON.stringify(load.stops || []),
      load.weight,
      load.trailerType,
      load.miles,
      load.commodity,
      load.rate || 0,
      load.notes || null,
      load.customer_id
    ]
  );

  return await getLoadById(id);
};

// Update a load
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
         notes = ?,
         customer_id = ?
     WHERE id = ?`,
    [
      JSON.stringify(mergedLoad.stops),
      mergedLoad.weight,
      mergedLoad.trailerType,
      mergedLoad.miles,
      mergedLoad.commodity,
      mergedLoad.rate || existingLoad.rate,
      mergedLoad.notes || null,
      mergedLoad.customer_id,
      id
    ]
  );

  return await getLoadById(id);
};

// Delete a load
const deleteLoad = async (id) => {
  await initializeDatabase();
  const load = await getLoadById(id);
  if (!load) {
    return null;
  }

  await dbRun('DELETE FROM loads WHERE id = ?', [id]);
  return load;
};

module.exports = {
  getAllLoads,
  getLoadsCount,
  getLoadById,
  createLoad,
  updateLoad,
  deleteLoad,
  getNextId,
  getNextOrderId,
  rowToLoad
};

