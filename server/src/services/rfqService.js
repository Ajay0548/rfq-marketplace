/**
 * Helper to determine if an RFQ is expired based on current time vs deadline
 * @param {Object} rfq
 * @returns {boolean}
 */
function isRfqExpired(rfq) {
  if (!rfq || !rfq.deadline) return false;
  return new Date(rfq.deadline) <= new Date();
}

/**
 * Computes the effective status of an RFQ
 * If database status is CLOSED or deadline is in the past, status is CLOSED
 * @param {Object} rfq
 * @returns {'OPEN' | 'CLOSED'}
 */
function getEffectiveStatus(rfq) {
  if (!rfq) return 'CLOSED';
  if (rfq.status === 'CLOSED' || isRfqExpired(rfq)) {
    return 'CLOSED';
  }
  return 'OPEN';
}

/**
 * Formats an RFQ object with computed effectiveStatus and isExpired flag
 * @param {Object} rfq
 * @returns {Object}
 */
function formatRfqResponse(rfq) {
  if (!rfq) return null;
  const expired = isRfqExpired(rfq);
  const effectiveStatus = getEffectiveStatus(rfq);

  return {
    ...rfq,
    effectiveStatus,
    isExpired: expired,
    quotationCount: rfq._count?.quotations ?? (Array.isArray(rfq.quotations) ? rfq.quotations.length : 0),
  };
}

module.exports = {
  isRfqExpired,
  getEffectiveStatus,
  formatRfqResponse,
};
