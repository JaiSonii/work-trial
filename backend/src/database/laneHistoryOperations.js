const { dbAll } = require('./connection');
const { initializeDatabase } = require('./schema');
const { getLoadById, rowToLoad } = require('./loadOperations');

// Get lane history for a load (loads with same origin and destination)
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

module.exports = {
  getLaneHistory
};

