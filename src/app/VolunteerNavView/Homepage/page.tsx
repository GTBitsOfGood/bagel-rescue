"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import styles from "./page.module.css";
import {
  getCurrentUserShiftsByDateRange,
  getUserShiftsByDateRange,
  UserShiftData,
  getOpenShifts,
} from "@/server/db/actions/userShifts";
import { getUserByEmail } from "@/server/db/actions/User";
import DateNavigation from "./components/DateNavigation";
import ShiftsTable from "./components/ShiftsTable";
import Pagination from "./components/Pagination";
import { ViewMode } from "./components/types";
import { handleAuthError } from "@/lib/authErrorHandler";
import { auth } from "@/server/db/firebase";
import { dateToString, getTodayDate } from "@/lib/dateHandler";
import { findDayInRange } from "@/lib/dateRangeHandler";

// Filter Icon Component
const FilterIcon = () => (
  <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.125 7C0.125 6.83424 0.190848 6.67527 0.308058 6.55806C0.425269 6.44085 0.58424 6.375 0.75 6.375H6.375C6.54076 6.375 6.69973 6.44085 6.81694 6.55806C6.93415 6.67527 7 6.83424 7 7C7 7.16576 6.93415 7.32474 6.81694 7.44195C6.69973 7.55916 6.54076 7.625 6.375 7.625H0.75C0.58424 7.625 0.425269 7.55916 0.308058 7.44195C0.190848 7.32474 0.125 7.16576 0.125 7ZM0.75 2.625H5.125C5.29076 2.625 5.44973 2.55916 5.56694 2.44195C5.68415 2.32473 5.75 2.16576 5.75 2C5.75 1.83424 5.68415 1.67527 5.56694 1.55806C5.44973 1.44085 5.29076 1.375 5.125 1.375H0.75C0.58424 1.375 0.425269 1.44085 0.308058 1.55806C0.190848 1.67527 0.125 1.83424 0.125 2C0.125 2.16576 0.190848 2.32473 0.308058 2.44195C0.425269 2.55916 0.58424 2.625 0.75 2.625ZM11.375 11.375H0.75C0.58424 11.375 0.425269 11.4409 0.308058 11.5581C0.190848 11.6753 0.125 11.8342 0.125 12C0.125 12.1658 0.190848 12.3247 0.308058 12.4419C0.425269 12.5592 0.58424 12.625 0.75 12.625H11.375C11.5408 12.625 11.6997 12.5592 11.8169 12.4419C11.9342 12.3247 12 12.1658 12 12C12 11.8342 11.9342 11.6753 11.8169 11.5581C11.6997 11.4409 11.5408 11.375 11.375 11.375ZM14.9422 3.43282L11.8172 0.307816C11.7591 0.249706 11.6902 0.203606 11.6143 0.172154C11.5385 0.140701 11.4571 0.124512 11.375 0.124512C11.2929 0.124512 11.2115 0.140701 11.1357 0.172154C11.0598 0.203606 10.9909 0.249706 10.9328 0.307816L7.80781 3.43282C7.69054 3.55009 7.62465 3.70915 7.62465 3.875C7.62465 4.04086 7.69054 4.19992 7.80781 4.31719C7.92509 4.43447 8.08415 4.50035 8.25 4.50035C8.41585 4.50035 8.57491 4.43447 8.69219 4.31719L10.75 2.2586V8.25C10.75 8.41576 10.8158 8.57474 10.9331 8.69195C11.0503 8.80916 11.2092 8.875 11.375 8.875C11.5408 8.875 11.6997 8.80916 11.8169 8.69195C11.9342 8.57474 12 8.41576 12 8.25V2.2586L14.0578 4.31719C14.1159 4.37526 14.1848 4.42132 14.2607 4.45275C14.3366 4.48418 14.4179 4.50035 14.5 4.50035C14.5821 4.50035 14.6634 4.48418 14.7393 4.45275C14.8152 4.42132 14.8841 4.37526 14.9422 4.31719C15.0003 4.25912 15.0463 4.19018 15.0777 4.11431C15.1092 4.03844 15.1253 3.95713 15.1253 3.875C15.1253 3.79288 15.1092 3.71156 15.0777 3.63569C15.0463 3.55982 15.0003 3.49088 14.9422 3.43282Z" fill="#072B68"/>
  </svg>
);

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
  const [openShifts, setOpenShifts] = useState<UserShiftData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(getTodayDate());
  const [viewMode, setViewMode] = useState<ViewMode>("Day");
  const [activeTab, setActiveTab] = useState<"myShifts" | "openShifts">("myShifts");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firebaseReady, setFirebaseReady] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  
  // rename later for readability
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [openShiftsPagination, setOpenShiftsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const handleShiftUpdated = () => {
    // increment value to trigger useEffect
    setRefreshTrigger(prev => prev + 1);
  };
  

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

  //fetches open shifts during on tab change
  useEffect(() => {
    if (!firebaseReady || activeTab !== "openShifts") return;

    const fetchOpenShifts = async () => {
      try {
        setLoading(true);
        setError(null);

        let shiftsData;

        if (viewMode === "Day") {
          const {startDate, endDate } = getDayRange(currentDate);
          shiftsData = await getOpenShifts(
            startDate,
            endDate,
            openShiftsPagination.page,
            openShiftsPagination.limit
          );
        } else {
          const { startDate, endDate } = getWeekRange(currentDate);
          shiftsData = await getOpenShifts(
            startDate, endDate, openShiftsPagination.page,
            openShiftsPagination.limit
          );
        }

        setOpenShifts(shiftsData.shifts);
        setOpenShiftsPagination(shiftsData.pagination);

      } catch (error) {
        console.error("Error fetching open shifts:", error);
        setError("Error loading open shifts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpenShifts();
  }, [firebaseReady, activeTab, currentDate, viewMode, openShiftsPagination.page, refreshTrigger]);

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
        let shifts: UserShiftData[];
        
        if (viewMode === "Day") {
          const { startDate, endDate } = getDayRange(currentDate);
          shiftsData = await getCurrentUserShiftsByDateRange(
            startDate,
            endDate,
            pagination.page,
            pagination.limit
          );
          shifts = shiftsData.shifts;
          shifts = shifts.map((shift) => {
            return {
              ...shift,
              occurrenceDate: currentDate
            }
          })
        } else {
          const { startDate, endDate } = getWeekRange(currentDate);
          shiftsData = await getCurrentUserShiftsByDateRange(
            startDate,
            endDate,
            pagination.page,
            pagination.limit
          );
          shifts = [];
          shiftsData.shifts.map((shift) => {
            shift.recurrenceDates?.map((date) => {
              shifts.push({
                ...shift,
                occurrenceDate: findDayInRange(date, startDate, endDate)!
              })
            })
            return shift;
          })
        }

        shifts = shifts.filter((shift) => {
          return !shift.canceledShifts?.includes(dateToString(currentDate));
        })
        
        setShifts(shifts);
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
  }, [userEmail, firebaseReady, currentDate, viewMode, pagination.page, pagination.limit, refreshTrigger]);

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

        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === "myShifts" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("myShifts")}
          >
            My Shifts ({shifts.length})
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === "openShifts" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("openShifts")}
          >
            Open Shifts ({openShifts.length})
          </button>
        </div>

        <div className={styles.filterContainer}>
          <button className={styles.filterButton}>
            <FilterIcon />
            <span>Filter</span>
          </button>
        </div>

        <ShiftsTable 
          shifts={activeTab === "myShifts" ? shifts : openShifts}
          date={currentDate}
          loading={loading}
          error={error}
          viewingDate={currentDate}
          isOpenShifts={activeTab === "openShifts"}
          onShiftUpdated={handleShiftUpdated}
          userShifts={shifts}
        />
        
        {!loading && !error && (activeTab === "myShifts" ? shifts : openShifts).length > 0 && (
          <Pagination
            total={activeTab === "myShifts" ? pagination.total : openShiftsPagination.total}
            page={activeTab === "myShifts" ? pagination.page : openShiftsPagination.page}
            limit={activeTab === "myShifts" ? pagination.limit : openShiftsPagination.limit}
            totalPages={activeTab === "myShifts" ? pagination.totalPages : openShiftsPagination.totalPages}
            onPageChange={(page) => {
              if (activeTab === "myShifts") {
                handlePageChange(page);
              } else {
                setOpenShiftsPagination(prev => ({ ...prev, page }));
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MyShiftsPage;