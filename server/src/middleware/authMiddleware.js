const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Middleware: Authenticate incoming JWT token in Authorization header
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization format. Expected: Bearer <token>',
    });
  }

  const token = parts[1];

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token.',
      });
    }

    // Attach decoded user payload to request object (contains id, email, role, name)
    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware: Authorize user by allowed role(s)
 * e.g. authorizeRole('BUYER'), authorizeRole('SUPPLIER'), or authorizeRole('BUYER', 'SUPPLIER')
 */
function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before authorization check.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Only ${allowedRoles.join(' or ')} role can access this resource.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};
