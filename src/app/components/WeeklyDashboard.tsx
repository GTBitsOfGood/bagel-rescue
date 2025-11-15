import React, { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faPlus,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { getWeekRange } from "@/lib/dateRangeHandler";

interface WeeklyDashboardHeaderProps {
  date: Date;
  AddDays: (days: number) => void;
}

const WeeklyDashboardHeader: React.FC<WeeklyDashboardHeaderProps> = ({
  date,
  AddDays,
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [adding, setAdding] = useState(false);

  const handleTimeFrameChange = (newTimeFrame: string) => {
    if (newTimeFrame === "Day") {
      router.push("/AdminNavView/DailyShiftDashboard");
    } else {
      router.push("/AdminNavView/WeeklyShiftDashboard");
    }
  };

  const { startOfWeek, endOfWeek } = getWeekRange(date);

  // Format the week range display
  const formatWeekRange = (start: Date, end: Date) => {
    const startMonth = start.toLocaleDateString("en-us", { month: "short" });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString("en-us", { month: "short" });
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    }
  };

  const debouncedAddDays = useCallback(debounce(AddDays, 300), [AddDays]);

  return (
    <div className="flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE] sticky top-0 bg-white z-50">
      <span className="text-[#072B68] mt-2 font-[700] text-4xl">Dashboard</span>
      <div className="flex gap-6">
        <div className="flex justify-between gap-4">
          <div className="flex border justify-between p-[.8rem] px-4 rounded-xl gap-5">
            <button
              title="adddays"
              onClick={() => debouncedAddDays(-7)}
              className="flex items-center"
            >
              <FontAwesomeIcon
                icon={faAngleLeft}
                className="cursor-pointer"
                width={16}
                height={16}
              />
            </button>
            <span className="font-[700]">
              {formatWeekRange(startOfWeek, endOfWeek)}
            </span>
            <button
              title="adddays"
              onClick={() => debouncedAddDays(7)}
              className="flex items-center"
            >
              <FontAwesomeIcon
                icon={faAngleRight}
                className="cursor-pointer"
                width={16}
                height={16}
              />
            </button>
          </div>
          <div className="flex border justify-between p-[.8rem] px-4 rounded-xl relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
            >
              Week
              <FontAwesomeIcon icon={faAngleDown} height={16} width={16} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full mt-2 bg-white border rounded shadow-lg">
                <div
                  onClick={() => {
                    handleTimeFrameChange("Week");
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  Week
                </div>
                <div
                  onClick={() => {
                    handleTimeFrameChange("Day");
                    setDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  Day
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem] px-5 gap-2 rounded-xl hover:bg-[#005bb5] cursor-pointer flex items-center"
          onClick={() => {
            setAdding(true);
            router.push("/AdminNavView/NewShiftPage");
          }}
        >
          {adding ? (
            <>
              <FontAwesomeIcon icon={faSpinner} width={16} height={16} spin />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} width={16} height={16} />
              <span>New Shift</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyDashboardHeader;

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
