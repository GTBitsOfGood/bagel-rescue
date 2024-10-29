"use client";

import Leaderboard from "./leaderboard";
import Overview from "./overview";
import RecentShifts from "./recent_shifts";
import RescueRecords from "./rescue_records";
import "./stylesheet.css";

function Analytics() {
  return (
    <div className="container">
      <p className="header-text">Analytics</p>
      <hr className="separator" />
      <div className="analytics-container">
        <div className="analytics-subcontainer">
          <Overview />
          <RescueRecords />
        </div>
        <div className="analytics-subcontainer">
          <RecentShifts />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

export default Analytics;
