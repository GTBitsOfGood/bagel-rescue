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


function WeeklyShiftDashboard() {
  const [shiftSearchText, setShiftSearchText] = useState("");
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [shiftsPerRoute, setShiftsPerRoute] = useState<Map<string, Shift[]>>(
    new Map()
  );

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

  const [date, setDate] = useState<Date>(new Date());

  const AddDays = (e: number) => {
    const newDate = new Date(date);
    // For weekly view, we move by 7 days (1 week) at a time
    newDate.setDate(newDate.getDate() + e);
    setDate(newDate);
  };

  function routesList() {
    return (
      <div className="routes-list">
        {routes.map((route, routeInd) => {
          return (
            <RouteCard
              key={routeInd}
              route={route}
              shiftsPerRoute={shiftsPerRoute}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1'>
        <WeeklyDashboardHeader date={date} AddDays={AddDays} />
        <div className="container">
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
