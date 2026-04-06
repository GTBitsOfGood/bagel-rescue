import React, { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { getWeekRange } from "@/lib/dateRangeHandler";
import { ADMIN_DASHBOARD_VIEW } from "@/lib/dashboardConstants";

interface WeeklyDashboardHeaderProps {
  date: Date;
  AddDays: (days: number) => void;
  isDateReady: boolean;
}

const WeeklyDashboardHeader: React.FC<WeeklyDashboardHeaderProps> = ({ date, AddDays, isDateReady }) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleTimeFrameChange = (newTimeFrame: string) => {
    if (newTimeFrame === 'Day') {
      localStorage.setItem(ADMIN_DASHBOARD_VIEW, 'daily');
      router.push('/AdminNavView/DailyShiftDashboard');
    } else {
      localStorage.setItem(ADMIN_DASHBOARD_VIEW, 'weekly');
      router.push('/AdminNavView/WeeklyShiftDashboard');
    }
  };

  const { startOfWeek, endOfWeek } = getWeekRange(date);

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
    <div className="flex min-w-0 w-full flex-row flex-wrap items-center justify-between gap-y-4 p-9 border-b-[1px] border-b-[#D3D8DE] sticky top-0 bg-white z-50">
      <span className="text-[#072B68] mt-2 font-[700] text-4xl shrink-0">Dashboard</span>
      <div className="flex min-w-0 flex-wrap items-center gap-6">
        {isDateReady ? (
          <div className="flex justify-between gap-4">
            <div className="flex border justify-between p-[.8rem] px-4 rounded-xl gap-5">
              <button
                title="adddays"
                type="button"
                onClick={() => debouncedAddDays(-7)}
              >
                <FontAwesomeIcon
                  icon={faAngleLeft}
                  className="mt-1 cursor-pointer"
                />
              </button>
              <span className="font-[700]">
                {formatWeekRange(startOfWeek, endOfWeek)}
              </span>
              <button
                title="adddays"
                type="button"
                onClick={() => debouncedAddDays(7)}
              >
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className="mt-1 cursor-pointer"
                />
              </button>
            </div>
            <div className="flex border justify-between p-[.8rem] px-4 rounded-xl relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="mr-6 flex items-center"
              >
                Week
                <FontAwesomeIcon icon={faAngleDown} className="ml-2 mt-1" />
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
        ) : (
          <div className="h-12 min-w-0 flex-1" aria-hidden />
        )}
        <div
          className="inline-flex grow-0 shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap rounded-xl bg-[#0F7AFF] p-[.8rem] px-5 font-[700] text-[#FFFFFF] hover:bg-[#005bb5] cursor-pointer min-w-max"
          onClick={() => router.push('/AdminNavView/NewShiftPage')}
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4 shrink-0" />
          <span>New Shift</span>
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
