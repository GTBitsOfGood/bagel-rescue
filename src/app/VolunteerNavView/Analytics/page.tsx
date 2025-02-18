"use client";

import { useEffect, useState } from "react";
import Leaderboard from "./leaderboard";
import Overview from "./overview";
import RecentShifts from "./recent_shifts";
import RescueRecords from "./rescue_records";
import "./stylesheet.css";
import { getAnalytics } from "@/server/db/actions/analytics";
import { Analytics } from "@/server/db/models/analytics";
import SideBar from '../../../components/Sidebar';

function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await getAnalytics();
      setAnalytics(JSON.parse(response || ""));
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="big-container">
      <SideBar />
      <div className="container">
        <hr className="separator" />
        <div className="analytics-container">
          <div className="analytics-subcontainer">
            <Overview
              totalBagelsDelivered={
                analytics ? analytics.totalBagelsDelivered : 0
              }
              bagelsThisMonth={0}
              bagelsMonthlyAverage={0}
              shiftsThisMonth={analytics ? analytics.shiftsThisMonth : 0}
              shiftsMonthlyAverage={
                analytics ? analytics.shiftsMonthlyAverage : 0
              }
              hoursThisMonth={0}
              hoursMonthlyAverage={0}
            />
            <RescueRecords />
          </div>
          <div className="analytics-subcontainer">
            <RecentShifts
              recentShifts={analytics ? analytics.recentShifts : []}
            />
            <Leaderboard
              bagelsDeliveredUsers={
                analytics ? analytics.leaderboardUsersBagelsDelivered : []
              }
              totalDeliveriesUsers={
                analytics ? analytics.leaderboardUsersTotalDeliveries : []
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
