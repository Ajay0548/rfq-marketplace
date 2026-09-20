const prisma = require('../services/prisma');
const { formatRfqResponse, isRfqExpired } = require('../services/rfqService');

/**
 * Get all RFQs created by the authenticated buyer
 * GET /api/buyer/rfqs
 */
async function getBuyerRfqs(req, res, next) {
  try {
    const rfqs = await prisma.rFQ.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quotations: true },
        },
      },
    });

    const formatted = rfqs.map(formatRfqResponse);

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * View quotations submitted for a specific RFQ
 * GET /api/rfqs/:id/quotations
 * (Only the buyer who owns the RFQ can view its quotations)
 */
async function getRfqQuotations(req, res, next) {
  try {
    const rfqId = parseInt(req.params.id, 10);
    if (isNaN(rfqId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFQ ID format.',
      });
    }

    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    // Authorization: only the RFQ owner can see all quotations
    if (rfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view quotations for your own RFQs.',
      });
    }

    const quotations = await prisma.quotation.findMany({
      where: { rfqId },
      orderBy: { quotedPrice: 'asc' }, // Order by best price first
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedQuotations = quotations.map((q) => ({
      id: q.id,
      rfqId: q.rfqId,
      supplierId: q.supplierId,
      supplierName: q.supplier.name,
      supplierEmail: q.supplier.email,
      quotedPrice: q.quotedPrice,
      estimatedDelivery: q.estimatedDelivery,
      message: q.message,
      createdAt: q.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        rfq: formatRfqResponse(rfq),
        quotations: formattedQuotations,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Buyer Dashboard Metrics
 * GET /api/buyer/dashboard
 */
async function getBuyerDashboard(req, res, next) {
  try {
    const buyerId = req.user.id;

    const rfqs = await prisma.rFQ.findMany({
      where: { buyerId },
      include: {
        _count: {
          select: { quotations: true },
        },
      },
    });

    let totalRfqs = rfqs.length;
    let openRfqs = 0;
    let closedRfqs = 0;
    let totalQuotations = 0;

    rfqs.forEach((rfq) => {
      const isExpired = isRfqExpired(rfq);
      if (rfq.status === 'OPEN' && !isExpired) {
        openRfqs++;
      } else {
        closedRfqs++;
      }
      totalQuotations += rfq._count.quotations;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRfqs,
        openRfqs,
        closedRfqs,
        totalQuotations,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBuyerRfqs,
  getRfqQuotations,
  getBuyerDashboard,
};
