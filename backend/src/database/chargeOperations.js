const { db, dbRun, dbAll } = require('./connection');
const { initializeDatabase } = require('./schema');
const { getLoadById } = require('./loadOperations');

// Save quote and charges for a load
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

// Get charges by load ID
const getChargesByLoadId = async (loadId) => {
  await initializeDatabase();
  const rows = await dbAll('SELECT * FROM charges WHERE load_id = ?', [loadId]);
  return rows;
};

module.exports = {
  saveQuote,
  getChargesByLoadId
};

