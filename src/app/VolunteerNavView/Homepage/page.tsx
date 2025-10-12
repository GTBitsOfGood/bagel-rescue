"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import styles from "./page.module.css";
import {
  getCurrentUserShifts,
  getCurrentUserShiftsByDateRange,
  getUserShifts,
  getUserShiftsByDateRange,
  UserShiftData
} from "@/server/db/actions/userShifts";
import { getUserByEmail } from "@/server/db/actions/User";
import DateNavigation from "./components/DateNavigation";
import ShiftsTable from "./components/ShiftsTable";
import Pagination from "./components/Pagination";
import { ViewMode } from "./components/types";
import { handleAuthError } from "@/lib/authErrorHandler";
import { auth } from "@/server/db/firebase";

/**
 * MyShiftsPage is a React functional component that displays a user's shifts.
 * It allows users to navigate through shifts in day or week views, with pagination.
 * The component fetches shifts based on the current date, view mode, and pagination settings.
 * It supports both test mode (bypassing authentication) and production mode (using Firebase authentication).
 *
 * State variables:
 * - `shifts`: The list of user shifts.
 * - `loading`: Indicates if the shifts are currently being loaded.
 * - `error`: Stores any error messages encountered during shift fetching.
 * - `currentDate`: The reference date for fetching shifts.
 * - `viewMode`: The mode of viewing shifts, either "Day" or "Week".
 * - `userEmail`: The email of the current user, used for authentication.
 * - `firebaseReady`: A flag indicating if Firebase is ready for use.
 * - `pagination`: An object containing pagination details (total, page, limit, totalPages).
 *
 * The component renders a sidebar, a header with date navigation, a shifts table, 
 * and pagination controls based on the state of shift data loading.
 */

const MyShiftsPage: React.FC = () => {
  const router = useRouter();
  const [shifts, setShifts] = useState<UserShiftData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("Day");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user && user.email) {
        setUserEmail(user.email);
        setFirebaseReady(true);
      } else {
        router.push("/Login");
      }
    });
  }, [router]);

  // Function to get start and end dates for day view
  const getDayRange = (date: Date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  };

  // Function to get start and end dates for week view (Monday-Sunday)
  const getWeekRange = (date: Date) => {
    const startDate = new Date(date);
    // Get Monday of current week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  };

  // Navigate to previous day/week
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "Day") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next day/week
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "Day") {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    // Reset pagination when view changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change in pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Fetch shifts when dependencies change
  useEffect(() => {
    if (!firebaseReady) return;
    if (userEmail === null) return;

    const fetchShifts = async () => {
      try {
        setLoading(true);
        setError(null);

        let shiftsData;
        
        if (process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true") {
          // Test mode - use the test user email
          const userData = await getUserByEmail(userEmail);
          if (!userData || !userData._id) {
            throw new Error("User not found");
          }
          
          if (viewMode === "Day") {
            const { startDate, endDate } = getDayRange(currentDate);
            shiftsData = await getUserShiftsByDateRange(
              userData._id.toString(),
              startDate,
              endDate,
              pagination.page,
              pagination.limit
            );
          } else {
            const { startDate, endDate } = getWeekRange(currentDate);
            shiftsData = await getUserShiftsByDateRange(
              userData._id.toString(),
              startDate,
              endDate,
              pagination.page,
              pagination.limit
            );
          }
        } else {
          // Production mode with Firebase auth
          if (viewMode === "Day") {
            const { startDate, endDate } = getDayRange(currentDate);
            shiftsData = await getCurrentUserShiftsByDateRange(
              startDate,
              endDate,
              pagination.page,
              pagination.limit
            );
          } else {
            const { startDate, endDate } = getWeekRange(currentDate);
            shiftsData = await getCurrentUserShiftsByDateRange(
              startDate,
              endDate,
              pagination.page,
              pagination.limit
            );
          }
        }
        
        setShifts(shiftsData.shifts);
        setPagination(shiftsData.pagination);
        
      } catch (error) {
        if (handleAuthError(error, router)) {
          return; // Auth error handled, user redirected
        }
        console.error("Error fetching shifts:", error);
        setError("Error loading shifts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, [userEmail, firebaseReady, currentDate, viewMode, pagination.page, pagination.limit]);

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>My Shifts</h1>
          
          <DateNavigation 
            currentDate={currentDate}
            viewMode={viewMode}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onViewModeChange={handleViewModeChange}
          />
        </div>

        <ShiftsTable 
          shifts={shifts}
          loading={loading}
          error={error}
        />
        
        {!loading && !error && shifts.length > 0 && (
          <Pagination
            total={pagination.total}
            page={pagination.page}
            limit={pagination.limit}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default MyShiftsPage;