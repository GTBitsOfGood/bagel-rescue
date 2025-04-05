import React from 'react';

type OverviewProps = {
  hoursThisMonth: number;
  hoursThisYear: number;
  shiftsThisMonth: number;
  shiftsThisYear: number;
};

function Overview({
  hoursThisMonth,
  hoursThisYear,
  shiftsThisMonth,
  shiftsThisYear,
}: OverviewProps) {
  return (
    <div className="analytics-card">
      <h2 className="section-title">Overview</h2>
      
      <div className="stat-section">
        <h3 className="stat-category-title">Volunteer Hours</h3>
        <div className="stat-box">
          <div className="stat-item">
            <p className="stat-period">This Month</p>
            <p className="stat-value">{hoursThisMonth} hrs</p>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-item">
            <p className="stat-period">This Year</p>
            <p className="stat-value">{hoursThisYear} hrs</p>
          </div>
        </div>
      </div>
      
      <div className="stat-section">
        <h3 className="stat-category-title">Total Shifts</h3>
        <div className="stat-box">
          <div className="stat-item">
            <p className="stat-period">This Month</p>
            <p className="stat-value">{shiftsThisMonth}</p>
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-item">
            <p className="stat-period">This Year</p>
            <p className="stat-value">{shiftsThisYear}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;