import React from "react";
import styles from "../page.module.css";
import { DateNavigationProps, ViewMode } from "./types";

/**
 * A component that displays a date navigation bar for the homepage, allowing the user to change the current date and view mode.
 *
 * @param {Date} currentDate - The current date to display.
 * @param {ViewMode} viewMode - The current view mode (Day or Week).
 * @param {() => void} onPrevious - The callback to call when the user clicks the previous button.
 * @param {() => void} onNext - The callback to call when the user clicks the next button.
 * @param {(mode: ViewMode) => void} onViewModeChange - The callback to call when the user changes the view mode.
 */
const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onViewModeChange,
}) => {
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

  // Function to format date for display
  const formatDate = () => {
    if (viewMode === "Day") {
      return new Date(currentDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      });
    } else {
      const { startDate, endDate } = getWeekRange(currentDate);
      return `${startDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })}`;
    }
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.dateNavigation}>
        <button onClick={onPrevious} className={styles.navButton}>
          &lt;
        </button>
        <span className={styles.dateRange}>{formatDate()}</span>
        <button onClick={onNext} className={styles.navButton}>
          &gt;
        </button>
      </div>

      <select
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
        className={styles.viewModeSelect}
      >
        <option value="Day">Day</option>
        <option value="Week">Week</option>
      </select>
    </div>
  );
};

export default DateNavigation;