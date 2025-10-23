import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import "./shiftCardStyle.css";
import { useEffect, useState } from "react";

interface ShiftCardVolunteer {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
}

interface ShiftCardProps {
  volunteers: ShiftCardVolunteer[];
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  routeName: string;
  locationDescription: string;
  recurrenceDates: string[];
  onOpenSidebar: () => void;
}

const DAY_MAP: Record<string, number> = {
  "su": 0, "mo": 1, "tu": 2, "we": 3, "th": 4, "fr": 5, "sa": 6,
};

export default function ShiftCard({ 
  volunteers, 
  startDate, 
  endDate, 
  startTime, 
  endTime, 
  routeName, 
  locationDescription, 
  recurrenceDates,
  onOpenSidebar
}: ShiftCardProps) {
  const [volunteerDisplay, setVolunteerDisplay] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [recurrenceDateStr, setRecurrenceDateStr] = useState("");

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  // Format volunteer names for display
  useEffect(() => {
    if (!volunteers || volunteers.length === 0) {
      setVolunteerDisplay("No volunteers");
      return;
    }

    const names = volunteers.map(v => `${v.firstName} ${v.lastName}`);

    if (names.length > 2) {
      setVolunteerDisplay(`${names.slice(0, 2).join(", ")} and ${names.length - 2} more…`);
    } else {
      setVolunteerDisplay(names.join(", "));
    }
  }, [volunteers]);

  // Format time range and recurrence dates
  useEffect(() => {
    if (!startTime || !endTime) {
      setTimeRange("--");
    } else {
      const start = new Date(startTime).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      const end = new Date(endTime).toLocaleTimeString([], { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      setTimeRange(`${start} - ${end}`);
    }

    const formattedDates = recurrenceDates
      .map(dateStr => dateStr.charAt(0).toUpperCase() + dateStr.slice(1))
      .join(", ");
    setRecurrenceDateStr(formattedDates);
  }, [startTime, endTime, recurrenceDates]);

  // Calculate next shift date based on recurrence
  const getNextShiftDate = (recurrenceDates?: string[]): string => {
    if (!recurrenceDates || recurrenceDates.length === 0) {
      return "--";
    }

    const recurrenceDays = recurrenceDates
      .map(day => DAY_MAP[day])
      .filter(dayNum => dayNum !== undefined);

    const today = new Date();

    // Loop up to 7 days ahead to find the next valid day
    for (let i = 0; i < 7; i++) {
      const testDate = new Date(today);
      testDate.setDate(today.getDate() + i);
      
      if (recurrenceDays.includes(testDate.getDay())) {
        return testDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }

    return "--";
  };

  return (
    <div className="shift-card" onClick={() => onOpenSidebar()}>
      {/* Header Section */}
      <div className="shift-card-header">
        <div className="shift-card-header-content">
          <div className="shift-card-title-section">
            <div className="shift-card-route-info">
              <span className="shift-card-route-name">{routeName}</span>
              <span className="shift-card-separator">-</span>
              <span className="shift-card-location">{locationDescription}</span>
            </div>
          </div>
          
          <div className="shift-card-recurrence">
            <span className="shift-card-recurrence-text">{recurrenceDateStr}</span>
          </div>
        </div>
        
        <button 
          className="shift-card-menu-button" 
          title="More options"
          aria-label="More options"
        >
          <FontAwesomeIcon icon={faEllipsis} />
        </button>
      </div>

      {/* Details Section */}
      <div className="shift-card-details">
        <div className="shift-card-details-header">
          <span className="shift-card-label">Volunteer(s)</span>
          <span className="shift-card-label">Time</span>
          <span className="shift-card-label">Period</span>
          <span className="shift-card-label">Next Shift</span>
        </div>
        
        <div className="shift-card-details-content">
          <span className="shift-card-volunteers">{volunteerDisplay}</span>
          <span className="shift-card-time">{timeRange}</span>
          <span className="shift-card-period">
            {startDateObj.toLocaleDateString("en-US")} - {endDateObj.toLocaleDateString("en-US")}
          </span>
          <span className="shift-card-next-shift">{getNextShiftDate(recurrenceDates)}</span>
        </div>
      </div>
    </div>
  );
}