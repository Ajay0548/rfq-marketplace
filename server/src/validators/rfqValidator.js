function validateRFQ(req, res, next) {
  const { productName, description, quantity, deliveryLocation, deadline } = req.body;
  const errors = [];

  if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
    errors.push('Product / Service Name is required.');
  } else if (productName.trim().length > 200) {
    errors.push('Product / Service Name must be less than 200 characters.');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Requirement Description is required.');
  } else if (description.trim().length > 3000) {
    errors.push('Description must be less than 3000 characters.');
  }

  const parsedQty = Number(quantity);
  if (quantity === undefined || quantity === null || isNaN(parsedQty) || !Number.isInteger(parsedQty) || parsedQty <= 0) {
    errors.push('Quantity is required and must be a positive whole number.');
  }

  if (!deliveryLocation || typeof deliveryLocation !== 'string' || deliveryLocation.trim().length === 0) {
    errors.push('Delivery Location is required.');
  } else if (deliveryLocation.trim().length > 200) {
    errors.push('Delivery Location must be less than 200 characters.');
  }

  if (!deadline) {
    errors.push('RFQ Deadline is required.');
  } else {
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.push('RFQ Deadline must be a valid date.');
    } else if (deadlineDate <= new Date()) {
      errors.push('RFQ Deadline must be a future date and time.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  // Normalize
  req.body.productName = productName.trim();
  req.body.description = description.trim();
  req.body.quantity = parsedQty;
  req.body.deliveryLocation = deliveryLocation.trim();
  req.body.deadline = new Date(deadline).toISOString();

  next();
}

module.exports = {
  validateRFQ,
};
