import React, { useState } from "react";
import styles from "../page.module.css";
import { ShiftsTableProps } from "./types";
import ShiftDetailsSidebar from "./ShiftDetailsSidebar";
import { UserShiftData } from "@/server/db/actions/userShifts";
import { dateToString } from "@/lib/dateHandler";

/**
 * ShiftsTable is a React component that displays a table of shifts.
 * If the `loading` prop is true, it displays a "Loading shifts..." message.
 * If the `error` prop is truthy, it displays an error message.
 * If the `shifts` prop is an empty array, it displays a "No shifts found..." message.
 * Otherwise, it displays a table of shifts with columns for route name, time, area, status, and an ellipsis button.
 * The table rows are rendered from the `shifts` prop, which should be an array of objects with the following properties:
 * - `id`: a unique identifier for the shift
 * - `routeName`: the name of the route
 * - `startTime` and `endTime`: the start and end times of the shift
 * - `area`: the area of the shift
 * - `status`: the status of the shift (either "Complete" or "Incomplete")
 */
const ShiftsTable: React.FC<ShiftsTableProps> = ({ 
  shifts, 
  loading, 
  error, 
  isOpenShifts = false,
  onShiftUpdated,
  viewingDate,
  userShifts = []
 }) => {
  const [selectedShift, setSelectedShift] = useState<UserShiftData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Handle row click to open sidebar
  const handleRowClick = (shift: UserShiftData) => {
    setSelectedShift(shift);
    setIsSidebarOpen(true);
  };

  // Handle closing sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedShift(null);
  };

  // Format time range for display (e.g. "10:00 AM - 12:00 PM")
  const formatTimeRange = (startTime: Date, endTime: Date) => {
    const formatTime = (date: Date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      });
    };
    
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading shifts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className={styles.noShiftsMessage}>
        <p>No shifts found for this period.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Sidebar */}
      {isSidebarOpen && (
        <ShiftDetailsSidebar 
          selectedShift={selectedShift}
          onCloseSidebar={handleCloseSidebar}
          isOpenShift={isOpenShifts}
          onShiftUpdated={onShiftUpdated}
          viewingDate={viewingDate}
          userShifts={userShifts}
        />
      )}

      {/* Separate header section */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>Shift Name</div>
        <div className={styles.headerCell}>Time</div>
        <div className={styles.headerCell}>Area</div>
        <div className={styles.headerCell}>Status</div>
        <div className={styles.headerCell}>Shift Date</div>
        <div className={styles.headerCell}></div>
      </div>
      
      {/* Table body section */}
      <div className={styles.tableBody}>
        {shifts.map((shift: UserShiftData) => (
          <div key={shift.id} className={styles.tableRow} onClick={() => handleRowClick(shift)}>
            <div className={styles.routeNameCell}>{shift.routeName}</div>
            <div className={styles.timeCell}>
              {formatTimeRange(shift.startTime, shift.endTime)}
            </div>
            <div className={styles.areaCell}>{shift.area}</div>
            <div className={styles.statusCell}>
              <span
                className={`${styles.statusBadge} ${
                  shift.status === "Complete"
                    ? styles.completeStatus
                    : styles.incompleteStatus
                }`}
              >
                {shift.status}
              </span>
            </div>
            <div className={styles.routeNameCell}>
              {shift.occurrenceDate ? dateToString(shift.occurrenceDate) : ""}
            </div>
            <div>
              {/* Ellipsis button - this will be implemented in the future */}
              <button className={styles.ellipsisButton} onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(shift);
                }}>...</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


export default ShiftsTable;