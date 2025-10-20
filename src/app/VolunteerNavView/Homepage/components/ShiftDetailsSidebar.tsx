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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
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
          {/* Route Information */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Route Information</h3>
            <p className="text-gray-600">{shift.area}</p>
          </div>

          {/* Time */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Time</h3>
            <p className="text-gray-600">{formatTimeRange(shift.startTime, shift.endTime)}</p>
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

          {/* Additional Information */}
          <div>
            <h3 className="font-semibold text-[#072B68] mb-2">Additional Information</h3>
            <p className="text-gray-600">
              Please arrive 10 minutes early for your shift. Contact the location manager if you have any questions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
          <div className="flex flex-col gap-3">
            <button
              className="w-full bg-[#0F7AFF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005bb5] transition-colors"
              onClick={() => {
                // TODO: Implement shift completion form
                console.log("Submit confirmation form for shift:", shift.id);
              }}
            >
              Submit Confirmation Form
            </button>
            <button
              className="w-full border-2 border-[#0F7AFF] text-[#0F7AFF] py-3 px-4 rounded-lg font-medium hover:bg-[#0F7AFF] hover:text-white transition-colors"
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
