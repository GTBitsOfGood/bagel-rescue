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
    if (newDate.getDate() - new Date().getDate() !== 7 || e === -1) {
      newDate.setDate(newDate.getDate() + e);
      setDate(newDate);
    }
  };

  function routesList() {
    return (
      <div className="routes-list">
        {routes.map((route, routeInd) => {
          const getTimesHeader = (r: IRoute) => {
            const dates = getDatesHelper(r)
              .flat()
              .sort((a: Date, b: Date) => {
                return a.toTimeString().localeCompare(b.toTimeString());
              });
            if (dates.length == 0) return "";
            const minTime = dates.at(0);
            const maxTime = dates.at(dates.length - 1);
            const options: Intl.DateTimeFormatOptions = {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            };
            return (
              minTime?.toLocaleTimeString("en-US", options) +
              " - " +
              maxTime?.toLocaleTimeString("en-US", options)
            );
          };

          const getDaysHeader = (r: IRoute) => {
            return getDatesHelper(r)
              .flat()
              .sort((a: Date, b: Date) => a.getDay() - b.getDay())
              .map((d: Date) => {
                return d.toLocaleDateString("en-US", {
                  weekday: "short",
                });
              })
              .join(", ");
          };

          const getVolunteers = (r: IRoute) => {
            return (
              shiftsPerRoute
                .get(r["_id"].toString())
                ?.map((s) => "Volunteer") || []
            );
          };

          const getDays = (r: IRoute) => {
            return getDatesHelper(r).map((s: Date[]) => {
              return (
                s
                  .sort((a, b) => a.getDay() - b.getDay())
                  .map((d) => {
                    return d.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                  })
                  .join(", ") || "-"
              );
            });
          };

          const getDatesHelper = (r: IRoute) => {
            return (
              shiftsPerRoute.get(r["_id"].toString())?.map((s) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                return s["recurrences"]
                  .filter((r) => {
                    const recurrenceDate = new Date(r["date"]);
                    return recurrenceDate >= today && recurrenceDate < nextWeek;
                  })
                  .map((r) => {
                    return new Date(r["date"]);
                  });
              }) || []
            );
          };

          const getAreas = (r: IRoute) => {
            return (
              shiftsPerRoute.get(r["_id"].toString())?.map((s) => "Area") || []
            );
          };

          const getNextShifts = (r: IRoute) => {
            return (
              shiftsPerRoute.get(r["_id"].toString())?.map((s) => {
                const firstShift = s["recurrences"]
                  .sort(
                    (a, b) =>
                      new Date(a["date"]).getTime() -
                      new Date(b["date"]).getTime()
                  )
                  .at(0);
                const options: Intl.DateTimeFormatOptions = {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                };
                return firstShift
                  ? new Intl.DateTimeFormat("en-US", options).format(
                      new Date(firstShift["date"])
                    )
                  : "-";
              }) || []
            );
          };

          return (
            <div key={routeInd} className="route-card">
              <div className="route-card-header">
                <p className="route-card-name">{route["routeName"]}</p>
                <div className="route-card-header-right-section">
                  <p className="route-card-time">
                    {getTimesHeader(route)} {getDaysHeader(route)}
                  </p>
                  <button title="More options">
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      className="route-card-ellipsis-icon"
                    />
                  </button>
                </div>
              </div>
              <div className="route-card-body">
                <div className="route-card-section">
                  <p className="route-card-section-header">Volunteer</p>
                  {getVolunteers(route).map((s, sInd) => (
                    <p key={sInd} className="route-card-section-body">
                      {s}
                    </p>
                  ))}
                </div>
                <div className="route-card-section">
                  <p className="route-card-section-header">Days</p>
                  {getDays(route).map((s, sInd) => (
                    <p key={sInd} className="route-card-section-body">
                      {s}
                    </p>
                  ))}
                </div>
                <div className="route-card-section">
                  <p className="route-card-section-header">Area</p>
                  {getAreas(route).map((s, sInd) => (
                    <p key={sInd} className="route-card-section-body">
                      {s}
                    </p>
                  ))}
                </div>
                <div className="route-card-section">
                  <p className="route-card-section-header">Next Shift</p>
                  {getNextShifts(route).map((s, sInd) => (
                    <p key={sInd} className="route-card-section-body">
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            </div>
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
