import React from 'react';

export default function StatsOverview({ customersCount, vehiclesCount, bookings }) {
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="stats-strip">
      <div className="stat-strip-item">
        <div className="stat-strip-val">{customersCount}</div>
        <div className="stat-strip-label">Registered Customers</div>
      </div>

      <div className="stat-divider"></div>

      <div className="stat-strip-item">
        <div className="stat-strip-val">{vehiclesCount}</div>
        <div className="stat-strip-label">Registered Vehicles</div>
      </div>

      <div className="stat-divider"></div>

      <div className="stat-strip-item">
        <div className="stat-strip-val">{bookings.length}</div>
        <div className="stat-strip-label">Total Bookings</div>
      </div>

      <div className="stat-divider"></div>

      <div className="stat-strip-item">
        <div className="stat-strip-val" style={{ color: 'var(--success)' }}>{completed}</div>
        <div className="stat-strip-label">Completed Services</div>
      </div>
    </div>
  );
}
