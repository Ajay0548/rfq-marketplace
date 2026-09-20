const prisma = require('../services/prisma');
const { formatRfqResponse, isRfqExpired } = require('../services/rfqService');

/**
 * Browse Marketplace RFQs (Public / Supplier browsing)
 * GET /api/rfqs
 * Query parameters:
 *   - search: string (matches productName, description, deliveryLocation)
 *   - location: string
 *   - status: 'OPEN' | 'CLOSED' | 'ALL' (default 'OPEN')
 */
async function getAllRfqs(req, res, next) {
  try {
    const { search, location, status = 'OPEN' } = req.query;

    const where = {};
    const now = new Date();

    // Status filtering
    if (status === 'OPEN') {
      where.status = 'OPEN';
      where.deadline = { gt: now }; // deadline must be in the future for open RFQs
    } else if (status === 'CLOSED') {
      where.OR = [
        { status: 'CLOSED' },
        { deadline: { lte: now } }
      ];
    }
    // If status === 'ALL', no deadline/status filter is applied

    // Location filtering
    if (location && location.trim()) {
      where.deliveryLocation = {
        contains: location.trim(),
        mode: 'insensitive',
      };
    }

    // Keyword search across product name, description, and location
    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { productName: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { deliveryLocation: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
 * Get RFQ Details by ID
 * GET /api/rfqs/:id
 */
async function getRfqById(req, res, next) {
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
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatRfqResponse(rfq),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new RFQ (BUYER only)
 * POST /api/rfqs
 */
async function createRfq(req, res, next) {
  try {
    const { productName, description, quantity, deliveryLocation, deadline } = req.body;

    const newRfq = await prisma.rFQ.create({
      data: {
        buyerId: req.user.id,
        productName,
        description,
        quantity,
        deliveryLocation,
        deadline: new Date(deadline),
        status: 'OPEN',
      },
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'RFQ created successfully.',
      data: formatRfqResponse(newRfq),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an RFQ (BUYER only, ownership check required)
 * PUT /api/rfqs/:id
 */
async function updateRfq(req, res, next) {
  try {
    const rfqId = parseInt(req.params.id, 10);
    if (isNaN(rfqId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFQ ID format.',
      });
    }

    // Check if RFQ exists
    const existingRfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!existingRfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    // Authorization: User must own this RFQ
    if (existingRfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own RFQs.',
      });
    }

    const { productName, description, quantity, deliveryLocation, deadline, status } = req.body;

    const updateData = {};
    if (productName !== undefined) updateData.productName = productName;
    if (description !== undefined) updateData.description = description;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (deliveryLocation !== undefined) updateData.deliveryLocation = deliveryLocation;
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (status && ['OPEN', 'CLOSED'].includes(status)) updateData.status = status;

    const updatedRfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updateData,
      include: {
        buyer: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'RFQ updated successfully.',
      data: formatRfqResponse(updatedRfq),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an RFQ (BUYER only, ownership check required)
 * DELETE /api/rfqs/:id
 */
async function deleteRfq(req, res, next) {
  try {
    const rfqId = parseInt(req.params.id, 10);
    if (isNaN(rfqId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid RFQ ID format.',
      });
    }

    const existingRfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });

    if (!existingRfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found.',
      });
    }

    // Ownership check
    if (existingRfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own RFQs.',
      });
    }

    await prisma.rFQ.delete({
      where: { id: rfqId },
    });

    return res.status(200).json({
      success: true,
      message: 'RFQ deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllRfqs,
  getRfqById,
  createRfq,
  updateRfq,
  deleteRfq,
};
