import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import { UserShiftData } from "@/server/db/actions/userShifts";

interface ShiftDetailsSidebarProps {
  shift: UserShiftData | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShiftDetailsSidebar: React.FC<ShiftDetailsSidebarProps> = ({ shift, isOpen, onClose }) => {
  if (!isOpen || !shift) return null;

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

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Sidebar */}
      <div className="absolute right-0 top-24 h-[calc(100vh-6rem)] w-[600px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Close sidebar"
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} size="lg" />
            </button>
            <h2 className="text-xl font-semibold text-[#072B68]">{shift.routeName}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">

          {/* Route Locations */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Route Location</h3>
            <p className="text-gray-600">{shift.area}</p>
          </div>

          {/* Route Information */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Route Information</h3>
            <p className="text-gray-600">{shift.area}</p>
          </div>

           {/* Date Range */}
           <div>
             <h3 className="font-semibold text-[#072B68] mb-2">Date Range</h3>
             <p className="text-gray-600">
               {(shift as any).shiftStartDate && (shift as any).shiftEndDate 
                 ? `${new Date((shift as any).shiftStartDate).toLocaleDateString("en-US", {
                     year: "numeric",
                     month: "long", 
                     day: "numeric"
                   })} - ${new Date((shift as any).shiftEndDate).toLocaleDateString("en-US", {
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
               {shift.startTime ? new Date(shift.startTime).toLocaleDateString("en-US", { weekday: "long" }) : "--"}
             </p>
           </div>

          {/* Time */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Time</h3>
            <p className="text-gray-600">{formatTimeRange(shift.startTime, shift.endTime)}</p>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Additional Information</h3>
            <p className="text-gray-600">
              Please arrive 10 minutes early for your shift. Contact the location manager if you have any questions.
            </p>
          </div>

          {/* Status */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Status</h3>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                shift.status === "Complete"
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {shift.status}
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
                console.log("Submit confirmation form for shift:", shift.id);
              }}
            >
              Submit Confirmation Form
            </button>
            <button
              className="border-2 border-[#D3D8DE] text-[#00377A] py-3 px-4 rounded-lg font-medium hover:bg-[#0F7AFF] hover:text-white transition-colors"
              onClick={() => {
                // TODO: Implement sub request
                console.log("Request sub for shift:", shift.id);
              }}
            >
              Request Sub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftDetailsSidebar;
