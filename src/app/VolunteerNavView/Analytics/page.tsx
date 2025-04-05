"use client";

import { useEffect, useState } from "react";
import SideBar from "../../../components/Sidebar";
import Overview from "./overview";
import RecentRoutes from "./recent_routes";
import "./stylesheet.css";
import { getUserByEmail } from "@/server/db/actions/User";
import {
  getCurrentUserUniqueRoutes,
  getUserUniqueRoutes,
  UserRoute,
} from "@/server/db/actions/userShifts";
// import { auth } from "@/server/db/firebase"; // Import Firebase auth
// import { onAuthStateChanged } from "firebase/auth";

type AnalyticsData = {
  hoursThisMonth: number;
  hoursThisYear: number;
  shiftsThisMonth: number;
  shiftsThisYear: number;
  recentRoutes: UserRoute[];
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);

  // Auto-login bypass for local development
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true") {
      const testEmail =
        process.env.NEXT_PUBLIC_TEST_USER_EMAIL || "testuser@example.com";
      setUserEmail(testEmail);
      setFirebaseReady(true);
      return;
    }

    // Only run Firebase in the browser, not during SSR
    if (typeof window === "undefined") return;

    // TODO: Firebase authentication implementation
    // For now, we'll assume authentication exists and set default values

    // Simulating successful authentication
    setUserEmail("avaye.dawadi@gmail.com");
    setFirebaseReady(true);
  }, []);

  // Fetch user data when authentication is determined
  useEffect(() => {
    if (!firebaseReady) return;
    if (userEmail === null) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await getUserByEmail(userEmail);
        if (!userData) {
          setError("User data not found. Please contact support.");
          setLoading(false);
          return;
        }

        const hoursThisMonth = userData.monthlyHoursVolunteered || 22;
        const hoursThisYear = userData.yearlyHoursVolunteered || 50;
        const shiftsThisMonth = userData.monthlyShiftAmount || 3;
        const shiftsThisYear = userData.yearlyShiftAmount || 12;

        // Fetch recent unique routes for the current user (past 6 months)
        // This uses the API from userShift.ts instead of mock data
        let userRoutes: UserRoute[] = [];
        try {
          // Try getting routes for the current logged-in user first
          userRoutes = await getCurrentUserUniqueRoutes();

          // TODO: since `getCurrentUserUniqueRoutes` relies on Firebase session
          // After Firebase session implemented, this block should be deleted
          if ((!userRoutes || userRoutes.length === 0) && userData._id) {
            console.log(
              "No routes found with getCurrentUserUniqueRoutes, trying with user ID"
            );
            userRoutes = await getUserUniqueRoutes(userData._id.toString());
          
          } else if (!userRoutes || userRoutes.length === 0) {
            console.log("No routes found and no valid user ID available");
            userRoutes = [];
          }
        } catch (routeError) {
          console.error("Error fetching user routes:", routeError);
          userRoutes = []; // continue with empty routes array rather than failing the entire page
        }

        setAnalyticsData({
          hoursThisMonth,
          hoursThisYear,
          shiftsThisMonth,
          shiftsThisYear,
          recentRoutes: userRoutes,
        });

        // Update the last updated timestamp
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
        setError("Error loading analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail, firebaseReady]);

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
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
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
