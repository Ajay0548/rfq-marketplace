const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All supplier routes require authentication and SUPPLIER role
router.use(authenticateToken, authorizeRole('SUPPLIER'));

router.get('/quotations', supplierController.getSupplierQuotations);
router.get('/dashboard', supplierController.getSupplierDashboard);

module.exports = router;
