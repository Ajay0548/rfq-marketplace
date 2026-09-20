const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All buyer routes require authentication and BUYER role
router.use(authenticateToken, authorizeRole('BUYER'));

router.get('/rfqs', buyerController.getBuyerRfqs);
router.get('/dashboard', buyerController.getBuyerDashboard);

module.exports = router;
