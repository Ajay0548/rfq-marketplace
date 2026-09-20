function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

function validateRegister(req, res, next) {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters long.');
  }

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters long.');
  }

  if (!role || !['BUYER', 'SUPPLIER'].includes(role)) {
    errors.push('Role is required and must be either "BUYER" or "SUPPLIER".');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0], // first error as primary message
      errors,
    });
  }

  // Normalize inputs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.role = role.trim();

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};
