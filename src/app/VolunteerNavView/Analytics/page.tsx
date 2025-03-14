"use client";

import { useEffect, useState } from "react";
import "./stylesheet.css";
import Overview from "./overview";
import RecentRoutes from "./recent_routes";
import SideBar from "../../../components/Sidebar";
import { getAnalytics } from "@/server/db/actions/analytics";
import { Analytics } from "@/server/db/models/analytics";
import {
  getMockUserRoutes,
  getUserUniqueRoutes,
  UserRoute,
} from "@/server/db/actions/userShifts";
import { useSession } from "next-auth/react";
import { getUserByEmail } from "@/server/db/actions/User";

type AnalyticsData = {
  hoursThisMonth: number;
  hoursThisYear: number;
  shiftsThisMonth: number;
  shiftsThisYear: number;
  recentRoutes: UserRoute[];
};

function AnalyticsPage() {
  const { data: session, status } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    hoursThisMonth: 0,
    hoursThisYear: 0,
    shiftsThisMonth: 0,
    shiftsThisYear: 0,
    recentRoutes: [],
  });
  const [lastUpdated, setLastUpdated] = useState<string>("mm-dd-yy hh:mm:ss");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated") {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get current user data
        if (!session?.user?.email) {
          console.error("No user email in session");
          setLoading(false);
          return;
        }

        // Fetch user data using email from session
        const userData = await getUserByEmail(session.user.email);
        if (!userData) {
          console.error("User data not found");
          setLoading(false);
          return;
        }

        // Extract hours and shifts data from user model
        const hoursThisMonth = userData.monthlyHoursVolunteered || 0;
        const hoursThisYear = userData.yearlyHoursVolunteered || 0;
        const shiftsThisMonth = userData.monthlyShiftAmount || 0;
        const shiftsThisYear = userData.yearlyShiftAmount || 0;

        // Fetch unique routes for this specific user
        let userRoutes: UserRoute[] = [];

        try {
          // For now, use the mock data because the current database schema
          // doesn't have a way to track which shifts a specific user participated in
          userRoutes = await getMockUserRoutes();

          // In a production environment, once the database has a way to track
          // user participation in shifts, you would use this:
          // if (userData._id) {
          //   userRoutes = await getUserUniqueRoutes(userData._id);
          // }
        } catch (routeError) {
          console.warn("Error fetching user routes:", routeError);
          userRoutes = await getMockUserRoutes();
        }

        setAnalyticsData({
          hoursThisMonth,
          hoursThisYear,
          shiftsThisMonth,
          shiftsThisYear,
          recentRoutes: userRoutes,
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status]);

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

        {loading ? (
          <div className="loading-container">
            <p>Loading analytics data...</p>
          </div>
        ) : (
          <div className="analytics-sections-container">
            <Overview
              hoursThisMonth={analyticsData.hoursThisMonth}
              hoursThisYear={analyticsData.hoursThisYear}
              shiftsThisMonth={analyticsData.shiftsThisMonth}
              shiftsThisYear={analyticsData.shiftsThisYear}
            />

            <RecentRoutes
              routes={analyticsData.recentRoutes}
              itemsPerPage={15}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
