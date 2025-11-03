import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenClip } from "@fortawesome/free-solid-svg-icons";
import { UserShiftData, DetailedShiftData, getDetailedShiftInfo } from "@/server/db/actions/userShifts";
import "./stylesheet.css";
import { dateToString } from "@/lib/dateHandler";


interface ShiftDetailsSidebarProps {
  selectedShift: UserShiftData | null;
  date: Date;
  onCloseSidebar: () => void;
}

const dayMap: { [key: string]: string } = {
  'mo': 'Monday',
  'tu': 'Tuesday',
  'we': 'Wednesday',
  'th': 'Thursday',
  'fr': 'Friday',
  'sa': 'Saturday',
  'su': 'Sunday'
};

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

const ShiftDetailsSidebar: React.FC<ShiftDetailsSidebarProps> = ({ 
  selectedShift,
  date,
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
        
        
        
        {loading && (
          <div className="sidebar-content-header">
            <p>Loading shift details...</p>
          </div>
        )}

        {!loading && detailedShift && (
          <div className="h-[80%]">
            {/* Content */}
            <div className="space-y-6 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden">

              {detailedShift?.comments && Object.keys(detailedShift?.comments || {}).includes(dateToString(date)) && (
                <div 
                  className="flex flex-col w-full min-h-[88px] rounded-xl p-4 text-[var(--Bagel-Rescue-Error-Red)] font-bold gap-4"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--Bagel-Rescue-Error-Red) 6%, transparent)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M20 10C20 15.523 15.523 20 10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10ZM10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18Z" fill="#E60000"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 12C9.73478 12 9.48043 11.8946 9.29289 11.7071C9.10536 11.5196 9 11.2652 9 11V6C9 5.73478 9.10536 5.48043 9.29289 5.29289C9.48043 5.10536 9.73478 5 10 5C10.2652 5 10.5196 5.10536 10.7071 5.29289C10.8946 5.48043 11 5.73478 11 6V11C11 11.2652 10.8946 11.5196 10.7071 11.7071C10.5196 11.8946 10.2652 12 10 12Z" fill="#E60000"/>
                      <path d="M9 14C9 13.7348 9.10536 13.4804 9.29289 13.2929C9.48043 13.1054 9.73478 13 10 13C10.2652 13 10.5196 13.1054 10.7071 13.2929C10.8946 13.4804 11 13.7348 11 14C11 14.2652 10.8946 14.5196 10.7071 14.7071C10.5196 14.8946 10.2652 15 10 15C9.73478 15 9.48043 14.8946 9.29289 14.7071C9.10536 14.5196 9 14.2652 9 14Z" fill="#E60000"/>
                    </svg>

                    <span>Comments</span>
                  </div>
                  <p className="w-full text-[var(--Bagel-Rescue-Text)] font-medium">
                    {detailedShift.comments[dateToString(date)]}
                  </p>
                </div>
              )}

              <h2 className="text-[24px] font-bold text-[#072B68]">{shiftData.routeName}</h2>

              {/* Route Locations */}
              <div>
                <h3 className="font-semibold text-[#072B68] mb-2">Route Locations</h3>
                {detailedShift?.routeInfo?.locations && detailedShift.routeInfo.locations.length > 0 ? (
                  detailedShift.routeInfo.locations.map((location, index) => (
                    <p key={index}>{location}</p>
                  ))
                ) : (
                  <p>{shiftData.area || "Location information not available"}</p>
                )}
              </div>

              {/* Route Information */}
              {detailedShift.routeInfo.additionalInfo && (
                <div>
                  <h3 className="font-semibold text-[#072B68] mb-2">Route Information</h3>
                  <p className="text-gray-600">{detailedShift.routeInfo.additionalInfo}</p>
                </div>
              )}

              {/* Date Range */}
              <div>
                <h3 className="font-semibold text-[#072B68] mb-2">Date Range</h3>
                <p className="text-gray-600">
                  {(detailedShift as any).shiftStartDate && (detailedShift as any).shiftEndDate 
                    ? `${new Date((detailedShift as any).shiftStartDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long", 
                        day: "numeric"
                      })} - ${new Date((detailedShift as any).shiftEndDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long", 
                        day: "numeric"
                      })}`
                    : "--"
                  }
                </p>
              </div>

              {/* Days */}
              <div>
                <h3 className="font-semibold text-[#072B68] mb-2">Days</h3>
                <p className="text-gray-600">
                  {detailedShift!.recurrenceDates.map((date, index) => (
                    <span key={index}>
                      {(index != 0 ? ", " : "") + dayMap[date]}
                    </span>
                  ))}
                </p>
              </div>

              {/* Time */}
              <div>
                <h3 className="font-semibold text-[#072B68] mb-2">Time</h3>
                <p className="text-gray-600">{formatTimeRange(detailedShift.shiftStartDate, detailedShift.shiftEndDate)}</p>
              </div>

              {/* Additional Information */}
              {detailedShift.additionalInfo && (
                <div>
                  <h3 className="font-semibold text-[#072B68] mb-2">Additional Information</h3>
                  <p className="text-gray-600">{detailedShift.additionalInfo}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="font-semibold text-[#072B68] mb-2">Status</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    shiftData.status === "Complete"
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {detailedShift!.status}
                </span>
              </div>          
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white">
              <div className="flex flex-row gap-3">
                <button
                  className=" bg-[#0F7AFF] text-white py-3 px-4 rounded-lg font-small hover:bg-[#005bb5] transition-colors"
                  onClick={() => {
                    // TODO: Implement shift completion form
                    console.log("Submit confirmation form for shift:", detailedShift!.id);
                  }}
                >
                  Submit Confirmation Form
                </button>
                <button
                  className="border-2 border-[#D3D8DE] text-[#00377A] py-3 px-4 rounded-lg font-medium hover:bg-[#0F7AFF] hover:text-white transition-colors"
                  onClick={() => {
                    // TODO: Implement sub request
                    console.log("Request sub for shift:", detailedShift!.id);
                  }}
                >
                  Request Sub
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
    </div>
  );
};

export default ShiftDetailsSidebar;
