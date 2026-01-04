const express = require('express');
const router = express.Router();
const {
  getAllLoadsHandler,
  getLoadByIdHandler,
  createLoadHandler,
  updateLoadHandler,
  deleteLoadHandler,
  getLaneHistoryHandler
} = require('../controllers/loadController');
const {
  calculateQuoteHandler,
  getChargesHandler
} = require('../controllers/calculatorController');

// GET /api/loads - Get all loads
router.get('/', getAllLoadsHandler);

// GET /api/loads/:id/lane-history - Get lane history for a load
router.get('/:id/lane-history', getLaneHistoryHandler);

// GET /api/loads/:id/charges - Get charges for a load
router.get('/:id/charges', getChargesHandler);

// POST /api/loads/:id/calculate - Calculate and save quote
router.post('/:id/calculate', calculateQuoteHandler);

// GET /api/loads/:id - Get load by ID
router.get('/:id', getLoadByIdHandler);

// POST /api/loads - Create a new load
router.post('/', createLoadHandler);

// PUT /api/loads/:id - Update a load
router.put('/:id', updateLoadHandler);

// DELETE /api/loads/:id - Delete a load
router.delete('/:id', deleteLoadHandler);

module.exports = router;

