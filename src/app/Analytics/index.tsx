"use client";

import { useEffect, useState } from "react";
import Leaderboard from "./leaderboard";
import Overview from "./overview";
import RecentShifts from "./recent_shifts";
import RescueRecords from "./rescue_records";
import "./stylesheet.css";
import { getAnalytics } from "@/server/db/actions/analytics";
import { Analytics } from "@/server/db/models/analytics";

function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await getAnalytics();
      setAnalytics(response || null);
    };
    fetchAnalytics();
  }, []);

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
