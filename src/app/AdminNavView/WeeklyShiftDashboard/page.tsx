"use client";

import "./stylesheet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpShortWide,
  faMagnifyingGlass,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import { getAllShifts } from "@/server/db/actions/shift";
import { getAllRoutes } from "@/server/db/actions/Route";
import WeeklyDashboardHeader from '../../components/WeeklyDashboard';
import AdminSidebar from '../../../components/AdminSidebar';
import RouteCard from '../../components/RouteCard';
import WeeklyShiftSidebar from "@/app/components/WeeklyShiftSidebar";
import { getShiftUsers } from "@/server/db/actions/userShifts";

export type WeeklyShiftSidebarInfo = {
  route: IRoute;
  shifts: Shift[];
  volunteersPerShift: Map<string, string>;
}

function WeeklyShiftDashboard() {
  const [shiftSearchText, setShiftSearchText] = useState("");
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [shiftsPerRoute, setShiftsPerRoute] = useState<Map<string, Shift[]>>(
    new Map()
  );
  const [selectedItem, setSelectedItem] = useState<WeeklyShiftSidebarInfo | null>(null);
  const [volunteersPerShift, setVolunteersPerShift] = useState<Map<string, string>>(new Map());


  useEffect(() => {
    const fetchRoutes = async () => {
      const routes_response = await getAllRoutes();
      const routes_data = JSON.parse(routes_response || "[]");
      setRoutes(routes_data || []);
    };

    const fetchShifts = async () => {
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
    };

    fetchRoutes();
    fetchShifts();
  }, []);

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

  const [date, setDate] = useState<Date>(new Date());

  const AddDays = (e: number) => {
    const newDate = new Date(date);
    // For weekly view, we move by 7 days (1 week) at a time
    newDate.setDate(newDate.getDate() + e);
    setDate(newDate);
  };


  // Can definitely be made more efficient - do not need to pass entire shiftsPerRoute into every Route card
  function routesList() {
    return (
      <div className="routes-list">
      {routes.map((route) => {
        const shiftsForRoute = shiftsPerRoute.get(route._id.toString()) ?? [];

        return (
          <RouteCard
            key={route._id.toString()}
            route={route}
            shifts={shiftsForRoute}   
            volunteersPerShift={volunteersPerShift}
            onOpenSidebar={(route: IRoute, shifts: Shift[], volunteersPerShift: Map<string, string>) => {
              setSelectedItem({ route, shifts, volunteersPerShift });
            }}
          />
        );
      })}
    </div>
    );
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
          {routesList()}
        </div>
      </div>
    </div>
  );
}

export default WeeklyShiftDashboard;
