"use client";

import { useEffect, useState } from "react";
import "./stylesheet.css";
import Overview from "./overview";
import RecentRoutes from "./recent_routes";
import SideBar from "../../../components/Sidebar";
import { getAnalytics } from "@/server/db/actions/analytics";
import { Analytics } from "@/server/db/models/analytics";

type Route = {
  name: string;
  date: string;
};

type AnalyticsData = {
  hoursThisMonth: number;
  hoursThisYear: number;
  shiftsThisMonth: number;
  shiftsThisYear: number;
  recentRoutes: Route[];
};

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    hoursThisMonth: 0,
    hoursThisYear: 0,
    shiftsThisMonth: 0,
    shiftsThisYear: 0,
    recentRoutes: [],
  });
  const [lastUpdated, setLastUpdated] = useState<string>("mm-dd-yy hh:mm:ss");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user from session
        const session = await getSession();
        if (!session || !session.user || !session.user.email) {
          console.error("No user session found");
          return;
        }

        // Fetch user data using email
        const userData = await getUserByEmail(session.user.email);
        if (!userData) {
          console.error("User data not found");
          return;
        }

        // Extract hours and shifts data from user model
        const hoursThisMonth = userData.monthlyHoursVolunteered || 0;
        const hoursThisYear = userData.yearlyHoursVolunteered || 0;
        const shiftsThisMonth = userData.monthlyShiftAmount || 0;
        const shiftsThisYear = userData.yearlyShiftAmount || 0;

        // Fetch shifts and filter for recent unique routes
        // Note: This is a placeholder, as we need to implement a method to fetch the user's shifts
        // For now, we'll use dummy data that matches the mockup
        const routes: Route[] = [
          { name: "Goldberg's WPF + The Tower", date: "10-03-23" },
          { name: "Emerald City Bagels", date: "10-01-23" },
          { name: "Henri's Brookhaven", date: "09-02-20" },
        ];

        // In a real implementation, we'd need to:
        // 1. Fetch shifts belonging to this user
        // 2. Filter for the past 6 months
        // 3. Extract unique routes
        // 4. Format the dates

        setAnalyticsData({
          hoursThisMonth,
          hoursThisYear,
          shiftsThisMonth,
          shiftsThisYear,
          recentRoutes: routes,
        });

        // Set the last updated time
        const now = new Date();
        setLastUpdated(
          `${String(now.getMonth() + 1).padStart(2, "0")}-${String(
            now.getDate()
          ).padStart(2, "0")}-${String(now.getFullYear()).slice(-2)} ${String(
            now.getHours()
          ).padStart(2, "0")}:${String(now.getMinutes()).padStart(
            2,
            "0"
          )}:${String(now.getSeconds()).padStart(2, "0")}`
        );
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="big-container">
      <SideBar />
      <div className="analytics-content-container">
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-last-updated">
            Last updated on {lastUpdated}
          </p>
        </div>

        <div className="analytics-sections-container">
          <Overview
            hoursThisMonth={analyticsData.hoursThisMonth}
            hoursThisYear={analyticsData.hoursThisYear}
            shiftsThisMonth={analyticsData.shiftsThisMonth}
            shiftsThisYear={analyticsData.shiftsThisYear}
          />

          <RecentRoutes routes={analyticsData.recentRoutes} itemsPerPage={15} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
