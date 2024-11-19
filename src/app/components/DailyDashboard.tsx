import React, { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  date: Date;
  AddDays: (days: number) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ date, AddDays }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [timeFrame, setTimeFrame] = useState("Day");

    const handleTimeFrameChange = (newTimeFrame: string) => {
        setTimeFrame(newTimeFrame);
        if (newTimeFrame === 'Day') {
            router.push('/AdminNavView/DailyShiftDashboard');
        } else {
            router.push('/AdminNavView/WeeklyShiftDashboard');
        }
    };

  const debouncedAddDays = useCallback(debounce(AddDays, 300), [AddDays]);

  return (
    <div className="flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE]">
      <span className="text-[#072B68] mt-2 font-[700] text-4xl">Dashboard</span>
      <div className="flex gap-6">
        <div className="flex justify-between gap-4">
          <div className="flex border justify-between p-[.8rem] px-4 rounded-xl gap-5">
            <button title="adddays" onClick={() => debouncedAddDays(-1)}>
              <FontAwesomeIcon
                icon={faAngleLeft}
                className="mt-1 cursor-pointer"
              />
            </button>
            <span className="font-[700]">
              {date.toLocaleDateString("en-us", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              })}
            </span>
            <button title="adddays" onClick={() => debouncedAddDays(1)}>
              <FontAwesomeIcon
                icon={faAngleRight}
                className="mt-1 cursor-pointer"
              />
            </button>
          </div>
          <div className="flex border justify-between p-[.8rem] px-4 rounded-xl relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="mr-6 flex items-center"
            >
              {timeFrame}
              <FontAwesomeIcon icon={faAngleDown} className="ml-2 mt-1" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 bg-white border rounded shadow-lg">
                {timeFrame === "Day" ? (
                  <>
                    <div
                      onClick={() => handleTimeFrameChange("Day")}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      Day
                    </div>
                    <div
                      onClick={() => handleTimeFrameChange("Week")}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      Week
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => handleTimeFrameChange("Week")}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      Week
                    </div>
                    <div
                      onClick={() => handleTimeFrameChange("Day")}
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    >
                      Day
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div 
          className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem] px-5 gap-2 rounded-xl hover:bg-[#005bb5] cursor-pointer"
          onClick={() => router.push('/AdminNavView/NewShiftPage')}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-3" />
          <span>New Shift</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
