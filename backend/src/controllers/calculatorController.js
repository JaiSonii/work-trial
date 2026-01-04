const { saveQuote, getChargesByLoadId } = require('../database/index');

// Calculate and save quote
const calculateQuoteHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseCost, miles, accessorialCharges, marginPercentage, subtotal, finalQuote } = req.body;
    
    // Get load to get customer_id
    const { getLoadById } = require('../database/index');
    const load = await getLoadById(id);
    
    if (!load) {
      return res.status(404).json({
        success: false,
        message: `Load with id ${id} not found`
      });
    }
    
    // Validate required fields
    if (baseCost === undefined || miles === undefined || finalQuote === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: baseCost, miles, finalQuote'
      });
    }
    
    // Save quote and charges
    const updatedLoad = await saveQuote(
      id,
      load.customer_id,
      finalQuote,
      accessorialCharges || []
    );
    
    res.status(200).json({
      success: true,
      message: 'Quote calculated and saved successfully',
      data: {
        load: updatedLoad,
        quote: {
          baseCost,
          miles,
          accessorialCharges: accessorialCharges || [],
          marginPercentage: marginPercentage || 0,
          subtotal,
          finalQuote
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating quote',
      error: error.message
    });
  }
};

// Get charges for a load
const getChargesHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const charges = await getChargesByLoadId(id);
    
    res.status(200).json({
      success: true,
      data: charges,
      count: charges.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charges',
      error: error.message
    });
  }
};

module.exports = {
  calculateQuoteHandler,
  getChargesHandler
};

