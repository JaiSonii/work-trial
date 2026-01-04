// Main database module - exports all database operations
const { initializeDatabase } = require('./schema');
const { initializeDemoData } = require('./seedData');
const loadOps = require('./loadOperations');
const customerOps = require('./customerOperations');
const chargeOps = require('./chargeOperations');
const laneHistoryOps = require('./laneHistoryOperations');

// Initialize demo data on module load
initializeDemoData().catch(err => {
  console.error('Error initializing demo data:', err);
});

module.exports = {
  // Load operations
  getAllLoads: loadOps.getAllLoads,
  getLoadsCount: loadOps.getLoadsCount,
  getLoadById: loadOps.getLoadById,
  createLoad: loadOps.createLoad,
  updateLoad: loadOps.updateLoad,
  deleteLoad: loadOps.deleteLoad,
  getNextId: loadOps.getNextId,
  getNextOrderId: loadOps.getNextOrderId,
  
  // Customer operations
  getCustomerById: customerOps.getCustomerById,
  getAllCustomers: customerOps.getAllCustomers,
  
  // Charge operations
  saveQuote: chargeOps.saveQuote,
  getChargesByLoadId: chargeOps.getChargesByLoadId,
  
  // Lane history operations
  getLaneHistory: laneHistoryOps.getLaneHistory,
  
  // Seed data
  initializeDemoData
};

