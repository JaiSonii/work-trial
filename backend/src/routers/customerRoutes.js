const express = require('express');
const router = express.Router();
const {
  getAllCustomersHandler,
  getCustomerByIdHandler
} = require('../controllers/customerController');

// GET /api/customers - Get all customers
router.get('/', getAllCustomersHandler);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', getCustomerByIdHandler);

module.exports = router;

