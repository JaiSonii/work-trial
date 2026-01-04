const {
  getAllLoads,
  getLoadsCount,
  getLoadById,
  getLaneHistory,
  createLoad,
  updateLoad,
  deleteLoad,
  getNextId
} = require('../database/index');

// Get all loads with pagination and filtering
const getAllLoadsHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Extract filter parameters
    const filters = {
      search: req.query.search || '',
      pickupCity: req.query.pickupCity || '',
      pickupState: req.query.pickupState || '',
      deliveryCity: req.query.deliveryCity || '',
      deliveryState: req.query.deliveryState || '',
      equipmentType: req.query.equipmentType || 'All',
      stops: req.query.stops || 'All'
    };
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be greater than 0'
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }
    
    const loads = await getAllLoads(page, limit, filters);
    const totalCount = await getLoadsCount(filters);
    const totalPages = Math.ceil(totalCount / limit);
    
    res.status(200).json({
      success: true,
      data: loads,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching loads',
      error: error.message
    });
  }
};

// Get load by ID
const getLoadByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const load = await getLoadById(id);
    
    if (!load) {
      return res.status(404).json({
        success: false,
        message: `Load with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      data: load
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching load',
      error: error.message
    });
  }
};

// Create a new load
const createLoadHandler = async (req, res) => {
  try {
    const { stops, weight, trailerType, miles, commodity, rate, customer_id } = req.body;
    
    // Validation
    if (!stops || !Array.isArray(stops) || stops.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Load must have at least 2 stops (pickup and delivery)'
      });
    }
    
    if (stops[0].type !== 'pickup') {
      return res.status(400).json({
        success: false,
        message: 'First stop must be a pickup'
      });
    }
    
    if (stops[stops.length - 1].type !== 'delivery') {
      return res.status(400).json({
        success: false,
        message: 'Last stop must be a delivery'
      });
    }
    
    if (!weight || !trailerType || !miles || !commodity || !customer_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: weight, trailerType, miles, commodity, customer_id'
      });
    }
    
    const nextId = await getNextId();
    const newLoad = {
      id: nextId,
      stops,
      weight,
      trailerType,
      miles,
      commodity,
      rate: rate || 0,
      customer_id
    };
    
    const createdLoad = await createLoad(newLoad);
    
    res.status(201).json({
      success: true,
      message: 'Load created successfully',
      data: createdLoad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating load',
      error: error.message
    });
  }
};

// Get lane history for a load
const getLaneHistoryHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const laneHistory = await getLaneHistory(id);
    
    res.status(200).json({
      success: true,
      data: laneHistory,
      count: laneHistory.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lane history',
      error: error.message
    });
  }
};

// Update a load
const updateLoadHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating the id
    if (updates.id) {
      delete updates.id;
    }
    
    const updatedLoad = await updateLoad(id, updates);
    
    if (!updatedLoad) {
      return res.status(404).json({
        success: false,
        message: `Load with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Load updated successfully',
      data: updatedLoad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating load',
      error: error.message
    });
  }
};

// Delete a load
const deleteLoadHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLoad = await deleteLoad(id);
    
    if (!deletedLoad) {
      return res.status(404).json({
        success: false,
        message: `Load with id ${id} not found`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Load deleted successfully',
      data: deletedLoad
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting load',
      error: error.message
    });
  }
};

module.exports = {
  getAllLoadsHandler,
  getLoadByIdHandler,
  createLoadHandler,
  updateLoadHandler,
  deleteLoadHandler,
  getLaneHistoryHandler
};
