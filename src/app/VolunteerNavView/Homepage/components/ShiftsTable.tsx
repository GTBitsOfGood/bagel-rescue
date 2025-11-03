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
const ShiftsTable: React.FC<ShiftsTableProps> = ({ shifts, date, loading, error }) => {
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
          date={date}
          onCloseSidebar={handleCloseSidebar}
        />
      )}

      {/* Separate header section */}
      <div className={styles.tableHeader}>
        <div className={styles.headerCell}>Shift Name</div>
        <div className={styles.headerCell}>Time</div>
        <div className={styles.headerCell}>Area</div>
        <div className={styles.headerCell}>Status</div>
        <div className={styles.headerCell}></div>
      </div>
      
      {/* Table body section */}
      <div className={styles.tableBody}>
        {shifts.map((shift) => (
          <div key={shift.id} className={styles.tableRow} onClick={() => handleRowClick(shift)}>
            <div className={styles.routeNameCell}>
              <div className="flex items-center gap-2.5">
                {shift.hasComment!.includes(dateToString(date)) && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10ZM10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18Z" fill="#E60000"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M10 12C9.73478 12 9.48043 11.8946 9.29289 11.7071C9.10536 11.5196 9 11.2652 9 11V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V11C11 11.2652 10.8946 11.5196 10.7071 11.7071C10.5196 11.8946 10.2652 12 10 12Z" fill="#E60000"/>
                    <path d="M9 14C9 13.7348 9.10536 13.4804 9.29289 13.2929C9.48043 13.1054 9.73478 13 10 13C10.2652 13 10.5196 13.1054 10.7071 13.2929C10.8946 13.4804 11 13.7348 11 14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14Z" fill="#E60000"/>
                  </svg>
                )}
                <span>{shift.routeName}</span>
              </div>
            </div>
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