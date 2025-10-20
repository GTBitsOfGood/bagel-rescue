import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenClip } from "@fortawesome/free-solid-svg-icons";
import { UserShiftData, DetailedShiftData, getDetailedShiftInfo } from "@/server/db/actions/userShifts";
import "./stylesheet.css";


interface ShiftDetailsSidebarProps {
  selectedShift: UserShiftData | null;
  onCloseSidebar: () => void;
}

const getDays = (recurrenceRule: string): string => {
  const dayMap: { [key: string]: string } = {
    'MO': 'Monday',
    'TU': 'Tuesday',
    'WE': 'Wednesday',
    'TH': 'Thursday',
    'FR': 'Friday',
    'SA': 'Saturday',
    'SU': 'Sunday'
  };

  try {
    // Parse the recurrence rule string
    const parts = recurrenceRule.split(';');
    const byDayPart = parts.find(part => part.startsWith('BYDAY='));
    
    if (byDayPart) {
      const dayCodes = byDayPart.substring(6).split(','); // Remove "BYDAY=" and split by comma
      const dayNames = dayCodes.map(code => dayMap[code] || code);
      return dayNames.join(', ');
    }
    
    return "Daily"; // Return default if no BYDAY found
  } catch (error) {
    return "Daily"; // Return default if parsing fails
  }
}

const formatTimeRange = (startTime: Date, endTime: Date): string => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const formatDateRange = (startTime: Date, endTime: Date): string => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  
  // If it's the same day, just show one date
  if (startTime.toDateString() === endTime.toDateString()) {
    return formatDate(startTime);
  }
  
  return `${formatDate(startTime)} - ${formatDate(endTime)}`;
};

const ShiftDetailsSidebar: React.FC<ShiftDetailsSidebarProps> = ({ 
  selectedShift, 
  onCloseSidebar 
}) => {
  const [detailedShift, setDetailedShift] = useState<DetailedShiftData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetailedShift = async () => {
      if (!selectedShift) return;
      
      setLoading(true);
      try {
        const detailed = await getDetailedShiftInfo(selectedShift.id);
        setDetailedShift(detailed);
      } catch (error) {
        console.error("Error fetching detailed shift info:", error);
        // Fallback to basic shift data
        setDetailedShift(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedShift();
  }, [selectedShift]);

  if (!selectedShift) return null;

  // Use detailed shift data if available, otherwise fall back to basic data
  const shiftData = detailedShift || selectedShift;

  return (
    <div className="main-sidebar">
      <div className="sidebar-header">
        <div className="arrow-box" onClick={onCloseSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44" fill="none">
            <path d="M17.7075 22.7076L7.70751 32.7076C7.51987 32.8952 7.26537 33.0006 7.00001 33.0006C6.73464 33.0006 6.48015 32.8952 6.29251 32.7076C6.10487 32.5199 5.99945 32.2654 5.99945 32.0001C5.99945 31.7347 6.10487 31.4802 6.29251 31.2926L15.5863 22.0001L6.29251 12.7076C6.10487 12.5199 5.99945 12.2654 5.99945 12.0001C5.99945 11.7347 6.10487 11.4802 6.29251 11.2926C6.48015 11.1049 6.73464 10.9995 7.00001 10.9995C7.26537 10.9995 7.51987 11.1049 7.70751 11.2926L17.7075 21.2926C17.8005 21.3854 17.8742 21.4957 17.9246 21.6171C17.9749 21.7385 18.0008 21.8687 18.0008 22.0001C18.0008 22.1315 17.9749 22.2616 17.9246 22.383C17.8742 22.5044 17.8005 22.6147 17.7075 22.7076ZM27.7075 21.2926L17.7075 11.2926C17.5199 11.1049 17.2654 10.9995 17 10.9995C16.7346 10.9995 16.4801 11.1049 16.2925 11.2926C16.1049 11.4802 15.9995 11.7347 15.9995 12.0001C15.9995 12.2654 16.1049 12.5199 16.2925 12.7076L25.5863 22.0001L16.2925 31.2926C16.1049 31.4802 15.9995 31.7347 15.9995 32.0001C15.9995 32.2654 16.1049 32.5199 16.2925 32.7076C16.4801 32.8952 16.7346 33.0006 17 33.0006C17.2654 33.0006 17.5199 32.8952 17.7075 32.7076L27.7075 22.7076C27.8005 22.6147 27.8742 22.5044 27.9246 22.383C27.9749 22.2616 28.0008 22.1315 28.0008 22.0001C28.0008 21.8687 27.9749 21.7385 27.9246 21.6171C27.8742 21.4957 27.8005 21.3854 27.7075 21.2926Z" fill="#072B68"/>
          </svg>            
        </div>
      </div>
      
      <div className="sidebar-content">
        <div className="sidebar-route-name">
          {shiftData.routeName}
        </div>
        
        {loading && (
          <div className="sidebar-content-header">
            <p>Loading shift details...</p>
          </div>
        )}
        
        <div className="sidebar-content-header">
          <h3>Route Locations</h3>
          {detailedShift?.routeInfo?.locations && detailedShift.routeInfo.locations.length > 0 ? (
            detailedShift.routeInfo.locations.map((location, index) => (
              <p key={index}>{location}</p>
            ))
          ) : (
            <p>{shiftData.area || "Location information not available"}</p>
          )}
        </div>
        
        <div className="sidebar-content-header">
          <h3>Information</h3>
          <p>Shift Status: {shiftData.status}</p>
          <p>Route: {shiftData.routeName}</p>
          {detailedShift?.routeInfo?.additionalInfo && detailedShift.routeInfo.additionalInfo !== "-" && (
            <p>Additional Info: {detailedShift.routeInfo.additionalInfo}</p>
          )}
        </div>
        
        <div className="sidebar-content-header">
          <h3>Date Range</h3>
          <p>{formatDateRange(shiftData.startTime, shiftData.endTime)}</p>
        </div>
        
        <div className="sidebar-content-header">
          <h3>Days</h3>
          <p>{detailedShift?.recurrenceRule ? getDays(detailedShift.recurrenceRule) : "Daily"}</p>
        </div>
        
        <div className="sidebar-content-header">
          <h3>Time</h3>
          <p>{formatTimeRange(shiftData.startTime, shiftData.endTime)}</p>
        </div>
        <div className="sidebar-footer">
          <button className="sidebar-btn confirm-btn">Submit Confirmation Form</button>
          <button className="sidebar-btn sub-btn">Request Sub</button>
        </div>
    </div>
    </div>
  );
};

export default ShiftDetailsSidebar;
