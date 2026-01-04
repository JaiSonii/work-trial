const { dbExec } = require('./connection');

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

module.exports = {
  initializeDatabase
};

