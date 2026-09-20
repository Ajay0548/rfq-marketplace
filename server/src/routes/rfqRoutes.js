const express = require('express');
const router = express.Router();
const rfqController = require('../controllers/rfqController');
const buyerController = require('../controllers/buyerController');
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const { validateRFQ } = require('../validators/rfqValidator');
const { validateQuotation } = require('../validators/quotationValidator');

// Public / Supplier browse marketplace RFQs
router.get('/', rfqController.getAllRfqs);
router.get('/:id', rfqController.getRfqById);

// Buyer operations on RFQ
router.post('/', authenticateToken, authorizeRole('BUYER'), validateRFQ, rfqController.createRfq);
router.put('/:id', authenticateToken, authorizeRole('BUYER'), validateRFQ, rfqController.updateRfq);
router.delete('/:id', authenticateToken, authorizeRole('BUYER'), rfqController.deleteRfq);

// Buyer views quotations for their RFQ
router.get('/:id/quotations', authenticateToken, authorizeRole('BUYER'), buyerController.getRfqQuotations);

// Supplier submits a quotation for an RFQ
router.post('/:rfqId/quotations', authenticateToken, authorizeRole('SUPPLIER'), validateQuotation, supplierController.submitQuotation);

module.exports = router;
