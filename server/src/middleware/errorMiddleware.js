/**
 * Centralized Error Handling Middleware
 * Ensures consistent JSON responses across all failures
 */
function errorHandler(err, req, res, next) {
  console.error('[Error Middleware]:', err.message || err);

  // Prisma Unique Constraint Violation (e.g. unique email or unique [rfqId, supplierId])
  if (err.code === 'P2002') {
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `Conflict: A record with this ${target} already exists.`,
    });
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record was not found.',
    });
  }

  // Custom HTTP Error (with status code)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Malformed JSON payload in body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  // General fallback 500 error
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An internal server error occurred.' 
      : err.message || 'Internal server error',
  });
}

/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
