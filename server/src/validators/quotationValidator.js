function validateQuotation(req, res, next) {
  const { quotedPrice, estimatedDelivery, message } = req.body;
  const errors = [];

  const price = Number(quotedPrice);
  if (quotedPrice === undefined || quotedPrice === null || isNaN(price) || price <= 0) {
    errors.push('Quoted Price is required and must be greater than 0.');
  }

  if (!estimatedDelivery || typeof estimatedDelivery !== 'string' || estimatedDelivery.trim().length === 0) {
    errors.push('Estimated Delivery Time is required (e.g., "7 days", "2 weeks").');
  } else if (estimatedDelivery.trim().length > 100) {
    errors.push('Estimated Delivery Time must be less than 100 characters.');
  }

  if (message && typeof message === 'string' && message.trim().length > 1000) {
    errors.push('Message / Notes must be less than 1000 characters.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  req.body.quotedPrice = price;
  req.body.estimatedDelivery = estimatedDelivery.trim();
  req.body.message = message ? message.trim() : null;

  next();
}

module.exports = {
  validateQuotation,
};
