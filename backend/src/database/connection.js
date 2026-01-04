const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// Create in-memory SQLite database
const db = new sqlite3.Database(':memory:');

// Promisify database methods
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));
const dbExec = promisify(db.exec.bind(db));

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  dbExec
};

