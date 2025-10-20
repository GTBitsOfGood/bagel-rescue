"use client";

import "./stylesheet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faMagnifyingGlass,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import { getAllShifts, getShiftsByWeek } from "@/server/db/actions/shift";
import { getAllRoutes } from "@/server/db/actions/Route";
import WeeklyDashboardHeader from '../../components/WeeklyDashboard';
import AdminSidebar from '../../../components/AdminSidebar';
import ShiftCard from '../../components/ShiftCard';
import WeeklyShiftSidebar from "@/app/components/WeeklyShiftSidebar";
import { getShiftUsers } from "@/server/db/actions/userShifts";

export type WeeklyShiftSidebarInfo = {
  route: IRoute;
  volunteers: string[];
}
import { handleAuthError } from "@/lib/authErrorHandler";

function WeeklyShiftDashboard() {
  const router = useRouter();
  const [shiftSearchText, setShiftSearchText] = useState("");
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [shiftsPerRoute, setShiftsPerRoute] = useState<Map<string, Shift[]>>(
    new Map()
  );
  const [selectedItem, setSelectedItem] = useState<WeeklyShiftSidebarInfo | null>(null);
  const [volunteersPerShift, setVolunteersPerShift] = useState<Map<string, string>>(new Map());
  const [weeklyShiftData, setWeeklyShiftData] = useState([]);
  const [date, setDate] = useState<Date>(new Date());

  const AddDays = (e: number) => {
    const newDate = new Date(date);
    // For weekly view, we move by 7 days (1 week) at a time
    newDate.setDate(newDate.getDate() + e);
    setDate(newDate);
  };



  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { startOfWeek, endOfWeek };
};


  useEffect(() => {
    const fetchWeeklyShifts = async (startDate: Date, endDate: Date) => {
   
      try {
        const weeklyShiftResponse = await getShiftsByWeek(startDate, endDate);
        const weeklyShiftData = JSON.parse(weeklyShiftResponse || "[]");
        console.log(weeklyShiftData)
        setWeeklyShiftData(weeklyShiftData);
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    }


    const fetchRoutes = async () => {
      try {
        const routes_response = await getAllRoutes();
        const routes_data = JSON.parse(routes_response || "[]");
        setRoutes(routes_data || []);
      } catch (error) {
        if (handleAuthError(error, router)) {
          return; // Auth error handled, user redirected
        }
        console.error("Error fetching routes:", error);
      }
    };

    const fetchShifts = async () => {
      try {
        const shift_response = await getAllShifts();
        const shift_data: Shift[] = JSON.parse(shift_response || "[]");
        const routeToShiftsMap = new Map<string, Shift[]>();
        shift_data.forEach((s) => {
          if (routeToShiftsMap.has(s["routeId"].toString())) {
            routeToShiftsMap.get(s["routeId"].toString())?.push(s);
          } else {
            routeToShiftsMap.set(s["routeId"].toString(), [s]);
          }
        });
        setShiftsPerRoute(routeToShiftsMap);
      } catch (error) {
        if (handleAuthError(error, router)) {
          return; // Auth error handled, user redirected
        }
        console.error("Error fetching shifts:", error);
      }
    };
    const { startOfWeek, endOfWeek } = getWeekRange(new Date("2025-11-14"));
    fetchRoutes();
    fetchShifts();
    fetchWeeklyShifts(startOfWeek, endOfWeek);
    console.log("Weekly Shift Data:", weeklyShiftData);
  }, [date]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const shiftIdList = Array.from(shiftsPerRoute.values())
        .flat()
        .map(shift => shift._id.toString());
      
      const usersPerShift = await getShiftUsers(shiftIdList);

      const map = new Map<string, string>();
      usersPerShift.forEach(item => {
        map.set(item.shiftId, item.fullName);
      });
  
      setVolunteersPerShift(map);
    };
  
    fetchVolunteers();
  }, [shiftsPerRoute]);

  // TODO: Can definitely be made more efficient - probably not need 
  // to pass entire volunteersPerShift into every Route card
  function routesList() {
      return (
        weeklyShiftData.map((shift, index) => {
          return (
          <ShiftCard
            key={shift["_id"] || index}
            volunteers={shift["volunteers"] || []}
            startDate={shift["shiftDate"] || ""}
            endDate={shift["shiftEndDate"] || "--"}
            startTime={shift["shiftStartTime"] || ""}
            endTime={shift["shiftEndTime"] || ""}
            routeName={shift["routeName"] || "--"}
            locationDescription={shift["locationDescription"] || ""}
            recurrenceDates={shift["recurrenceDates"] || []}
          />
          )
        })
      )

    // return (
    //   <div className="routes-list">
    //   {routes.map((route) => {
    //     const shiftsForRoute = shiftsPerRoute.get(route._id.toString()) ?? [];

    //     return (
    //       <ShiftCard
    //         key={route._id.toString()}
    //         route={route}
    //         shifts={shiftsForRoute}   
    //         volunteersPerShift={volunteersPerShift}
    //         onOpenSidebar={(route: IRoute, shifts: Shift[], volunteersPerShift: Map<string, string>) => {
    //           setSelectedItem({ route, shifts, volunteersPerShift });
    //         }}
    //       />
    //     );
    //   })}
    // </div>
    // );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1 relative'>
        <WeeklyDashboardHeader date={date} AddDays={AddDays} />
        <div className="container">
        {selectedItem && 
              <WeeklyShiftSidebar
                  shiftSidebarInfo={selectedItem}
                  onOpenSidebar={() => {
                      setSelectedItem(null);
                  }}
              />
          }
          <div className="spacer-50"></div>
          <div className="search-settings">
            <button className="sort-by-btn">
              <FontAwesomeIcon icon={faArrowUpShortWide} />
              <p>Sort By</p>
            </button>
            <input
              className="shift-search-input"
              type="text"
              placeholder="Search for a shift"
              onChange={(e) => setShiftSearchText(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="shift-search-icon"
            />
          </div>
          <div className="rounded-[.625rem] w-full bg-white border-x border-b border-[#7D7E82A8] border-opacity-65">
          {routesList()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyShiftDashboard;
