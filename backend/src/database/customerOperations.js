const { dbGet, dbAll } = require('./connection');
const { initializeDatabase } = require('./schema');

// Get customer by ID
const getCustomerById = async (id) => {
  await initializeDatabase();
  const row = await dbGet('SELECT * FROM customers WHERE id = ?', [id]);
  return row || null;
};

// Get all customers
const getAllCustomers = async () => {
  await initializeDatabase();
  const rows = await dbAll('SELECT id, company_name FROM customers ORDER BY company_name');
  return rows;
};

module.exports = {
  getCustomerById,
  getAllCustomers
};

