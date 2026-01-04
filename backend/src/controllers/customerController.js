const { getCustomerById, getAllCustomers } = require('../database');

// Get all customers
const getAllCustomersHandler = async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.status(200).json({
      success: true,
      data: customers,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

// Get customer by ID
const getCustomerByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomersHandler,
  getCustomerByIdHandler
};

