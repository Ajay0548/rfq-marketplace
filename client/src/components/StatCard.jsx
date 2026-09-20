import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: { bg: '#eff6ff', color: '#2563eb' },
    emerald: { bg: '#ecfdf5', color: '#059669' },
    amber: { bg: '#fffbeb', color: '#d97706' },
    purple: { bg: '#faf5ff', color: '#7c3aed' },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      {Icon && (
        <div className="stat-icon-wrapper" style={{ backgroundColor: scheme.bg, color: scheme.color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
