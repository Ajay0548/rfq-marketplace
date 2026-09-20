const prisma = require('../services/prisma');
const { isRfqExpired, formatRfqResponse, getEffectiveStatus } = require('../services/rfqService');

/**
 * Submit a quotation for an open RFQ (SUPPLIER only)
 * POST /api/rfqs/:rfqId/quotations
 */
async function submitQuotation(req, res, next) {
  try {
    const rfqId = parseInt(req.params.rfqId, 10);
    if (isNaN(rfqId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFQ ID format.',
      });
    }

    const { quotedPrice, estimatedDelivery, message } = req.body;
    const supplierId = req.user.id;

    // 1. Verify RFQ exists
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    // 2. Verify RFQ status is OPEN
    if (rfq.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Quotations are closed for this RFQ.',
      });
    }

    // 3. Verify deadline has not passed (Backend enforcement!)
    if (isRfqExpired(rfq)) {
      return res.status(400).json({
        success: false,
        message: 'RFQ deadline has passed. Quotations are no longer accepted.',
      });
    }

    // 4. Verify supplier has not already submitted a quotation for this RFQ
    const existingQuotation = await prisma.quotation.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId,
          supplierId,
        },
      },
    });

    if (existingQuotation) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a quotation for this RFQ.',
      });
    }

    // 5. Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        supplierId,
        quotedPrice,
        estimatedDelivery,
        message,
      },
      include: {
        rfq: {
          select: {
            id: true,
            productName: true,
            status: true,
            deadline: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully.',
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all quotations submitted by the authenticated supplier ("My Quotations")
 * GET /api/supplier/quotations
 */
async function getSupplierQuotations(req, res, next) {
  try {
    const supplierId = req.user.id;

    const quotations = await prisma.quotation.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: {
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const formatted = quotations.map((q) => {
      const effectiveStatus = getEffectiveStatus(q.rfq);
      return {
        id: q.id,
        rfqId: q.rfqId,
        quotedPrice: q.quotedPrice,
        estimatedDelivery: q.estimatedDelivery,
        message: q.message,
        createdAt: q.createdAt,
        rfq: {
          id: q.rfq.id,
          productName: q.rfq.productName,
          description: q.rfq.description,
          quantity: q.rfq.quantity,
          deliveryLocation: q.rfq.deliveryLocation,
          deadline: q.rfq.deadline,
          status: q.rfq.status,
          effectiveStatus,
          buyerName: q.rfq.buyer.name,
        },
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Supplier Dashboard metrics
 * GET /api/supplier/dashboard
 */
async function getSupplierDashboard(req, res, next) {
  try {
    const supplierId = req.user.id;
    const now = new Date();

    const [myQuotationsCount, activeRfqsCount] = await Promise.all([
      prisma.quotation.count({
        where: { supplierId },
      }),
      prisma.rFQ.count({
        where: {
          status: 'OPEN',
          deadline: { gt: now },
        },
      }),
    ]);

    // Calculate total value of quotes submitted
    const quotes = await prisma.quotation.findMany({
      where: { supplierId },
      select: { quotedPrice: true },
    });
    const totalQuotedValue = quotes.reduce((sum, q) => sum + q.quotedPrice, 0);

    return res.status(200).json({
      success: true,
      data: {
        myQuotationsCount,
        activeRfqsCount,
        totalQuotedValue,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitQuotation,
  getSupplierQuotations,
  getSupplierDashboard,
};
