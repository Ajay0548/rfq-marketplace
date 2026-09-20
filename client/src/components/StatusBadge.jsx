import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (type === 'role') {
    return status === 'BUYER' ? (
      <span className="badge badge-primary">Buyer</span>
    ) : (
      <span className="badge badge-info">Supplier</span>
    );
  }

  // RFQ Status
  const isClosed = status === 'CLOSED';
  return isClosed ? (
    <span className="badge badge-danger">Closed</span>
  ) : (
    <span className="badge badge-success">Open</span>
  );
}
