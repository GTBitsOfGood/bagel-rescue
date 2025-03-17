"use client";

import { useEffect, useState } from "react";
import SideBar from "../../../components/Sidebar";
import Overview from "./overview";
import RecentRoutes from "./recent_routes";
import "./stylesheet.css";
import { getUserByEmail } from "@/server/db/actions/User";
import { getMockUserRoutes, UserRoute } from "@/server/db/actions/userShifts";
import { auth } from "@/server/db/firebase"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

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
    recentRoutes: []
  });
  const [lastUpdated, setLastUpdated] = useState<string>("mm-dd-yy hh:mm:ss");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);

  // Initialize Firebase authentication safely
  useEffect(() => {
    // Only run Firebase in the browser, not during SSR
    if (typeof window === "undefined") return;
    
    let auth;
    try {
      // Dynamically import Firebase to avoid SSR issues
      const initializeFirebase = async () => {
        try {
          // Import Firebase auth only on client side
          const { auth: firebaseAuth } = await import("@/server/db/firebase");
          auth = firebaseAuth;
          
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              // User is signed in
              setUserEmail(user.email);
            } else {
              // User is signed out
              setUserEmail(null);
              setError("Please log in to view your analytics.");
              setLoading(false);
            }
          });
          
          setFirebaseReady(true);
          
          // Cleanup subscription on unmount
          return () => unsubscribe();
        } catch (error) {
          console.error("Firebase initialization error:", error);
          setError("Authentication service unavailable. Please try again later.");
          setLoading(false);
        }
      };
      
      initializeFirebase();
    } catch (error) {
      console.error("Firebase import error:", error);
      setError("Authentication service unavailable. Please try again later.");
      setLoading(false);
    }
  }, []);

  // Fetch user data when authentication is determined
  useEffect(() => {
    // If Firebase isn't ready or we're still determining auth state, don't proceed
    if (!firebaseReady) return;
    
    // If user is not logged in, we already show an error message
    if (userEmail === null) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data using email from Firebase auth
        const userData = await getUserByEmail(userEmail);
        if (!userData) {
          setError("User data not found. Please contact support.");
          setLoading(false);
          return;
        }

        // Extract hours and shifts data from user model
        const hoursThisMonth = userData.monthlyHoursVolunteered || 0;
        const hoursThisYear = userData.yearlyHoursVolunteered || 0;
        const shiftsThisMonth = userData.monthlyShiftAmount || 0;
        const shiftsThisYear = userData.yearlyShiftAmount || 0;
        
        // Fetch unique routes for this specific user
        const userRoutes = await getMockUserRoutes();
        
        setAnalyticsData({
          hoursThisMonth,
          hoursThisYear,
          shiftsThisMonth,
          shiftsThisYear,
          recentRoutes: userRoutes
        });
        
        // Set the last updated time
        const now = new Date();
        setLastUpdated(
          `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
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
          <p className="analytics-last-updated">Last updated on {lastUpdated}</p>
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