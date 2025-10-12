
'use client';
import router, { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Shift } from "@/server/db/models/shift";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight, faArrowUpShortWide } from "@fortawesome/free-solid-svg-icons";
import { faPenClip } from "@fortawesome/free-solid-svg-icons";
import { WeeklyShiftSidebarInfo } from "../AdminNavView/WeeklyShiftDashboard/page";
import "./stylesheet.css";
import { getAllLocationsById } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";
import { ILocation } from "@/server/db/models/Route";
import { useShiftStore } from '../store/shiftStore'
import { IRoute } from "@/server/db/models/Route";



//TODO: implement getShiftDateRange
function getShiftDateRange(shifts: Shift[]): string {
    return "---";
}

interface ShiftSidebarProps {
  shiftSidebarInfo: WeeklyShiftSidebarInfo;
  onOpenSidebar: () => void;
}

export interface EditShiftProps {
  timeRange: string;
  dateRange: string;
  days: string;
  volunteersPerShift: Map<string, string>;
  route: IRoute;
}

const WeeklyShiftSidebar: React.FC<ShiftSidebarProps> = ({ shiftSidebarInfo, onOpenSidebar }) => {
  const { shifts, route, volunteersPerShift } = shiftSidebarInfo;
  const [locations, setLocations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>("---");
  const [days, setDays] = useState<string>("---");
  const [timeRange, setTimeRange] = useState<string>("---");
  const [volunteerMap, setVolunteerMap] = useState<Map<Shift, string>>(new Map());
  const setShiftSidebarInfo = useShiftStore((state) => state.setShiftSidebarInfo);
  const router = useRouter();

  const getLocations = async (locationIds: string[]) => {
    const locations = await getAllLocationsById(locationIds);
    const parsed = locations ? JSON.parse(locations) : [];
    setLocations(parsed.map((loc: Location) => loc.locationName));
  };    

  const dayMap: Record<string, string> = {
    MO: "Monday",
    TU: "Tuesday",
    WE: "Wednesday",
    TH: "Thursday",
    FR: "Friday",
    SA: "Saturday",
    SU: "Sunday",
  };

  const getShiftVolunteers = () => {
    const newMap = new Map<Shift, string>();
  
    shifts.forEach(shift => {
      const volunteerName = volunteersPerShift.get(shift._id.toString());
      if (volunteerName) {
        newMap.set(shift, volunteerName);
      }
    });
  
    setVolunteerMap(newMap);
  };

  const getDays = (shifts: Shift[]) => {
    const daySet = new Set<string>();

    shifts.forEach((shift) => {
      const byDayPart = shift.recurrenceRule.split(";").find(p => p.startsWith("BYDAY="));
      if (byDayPart) {
        const dayCode = byDayPart.replace("BYDAY=", "");
        const day = dayMap[dayCode];
        if (day) daySet.add(day);
      }
    });

    setDays(daySet.size > 0 ? Array.from(daySet).join(", ") : "---");
  };

  const getTime = (shifts: Shift[]) => {
    if (shifts.length === 0) return setTimeRange("---");

    const firstShift = shifts[0]; // assuming all shifts share the same daily time range
    const minTime = new Date(firstShift.shiftDate);
    const maxTime = new Date(firstShift.shiftEndDate);

    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    setTimeRange(`${formatter.format(minTime)} - ${formatter.format(maxTime)}`);
  };

  useEffect(() => {
    setDateRange(getShiftDateRange(shifts));
    getLocations(route.locations.map((loc: ILocation) => loc.location.toString()));
    getDays(shifts);
    getTime(shifts);
    getShiftVolunteers();
  }, [shiftSidebarInfo]);


  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });

  const handleEditClick = () => {
    setShiftSidebarInfo({
      timeRange,
      dateRange,
      days,
      volunteersPerShift,
      route
    });
    router.push('/AdminNavView/EditShiftPage');
  };

  console.log(volunteerMap)
  console.log("HIIII")

  return (
    <div className="main-sidebar">
      <div className="sidebar-header">
        <div className="arrow-box" onClick={onOpenSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44" fill="none">
                <path d="M17.7075 22.7076L7.70751 32.7076C7.51987 32.8952 7.26537 33.0006 7.00001 33.0006C6.73464 33.0006 6.48015 32.8952 6.29251 32.7076C6.10487 32.5199 5.99945 32.2654 5.99945 32.0001C5.99945 31.7347 6.10487 31.4802 6.29251 31.2926L15.5863 22.0001L6.29251 12.7076C6.10487 12.5199 5.99945 12.2654 5.99945 12.0001C5.99945 11.7347 6.10487 11.4802 6.29251 11.2926C6.48015 11.1049 6.73464 10.9995 7.00001 10.9995C7.26537 10.9995 7.51987 11.1049 7.70751 11.2926L17.7075 21.2926C17.8005 21.3854 17.8742 21.4957 17.9246 21.6171C17.9749 21.7385 18.0008 21.8687 18.0008 22.0001C18.0008 22.1315 17.9749 22.2616 17.9246 22.383C17.8742 22.5044 17.8005 22.6147 17.7075 22.7076ZM27.7075 21.2926L17.7075 11.2926C17.5199 11.1049 17.2654 10.9995 17 10.9995C16.7346 10.9995 16.4801 11.1049 16.2925 11.2926C16.1049 11.4802 15.9995 11.7347 15.9995 12.0001C15.9995 12.2654 16.1049 12.5199 16.2925 12.7076L25.5863 22.0001L16.2925 31.2926C16.1049 31.4802 15.9995 31.7347 15.9995 32.0001C15.9995 32.2654 16.1049 32.5199 16.2925 32.7076C16.4801 32.8952 16.7346 33.0006 17 33.0006C17.2654 33.0006 17.5199 32.8952 17.7075 32.7076L27.7075 22.7076C27.8005 22.6147 27.8742 22.5044 27.9246 22.383C27.9749 22.2616 28.0008 22.1315 28.0008 22.0001C28.0008 21.8687 27.9749 21.7385 27.9246 21.6171C27.8742 21.4957 27.8005 21.3854 27.7075 21.2926Z" fill="#072B68"/>
            </svg>
        </div>
        <div className="bg-white text-[#00377A] font-[500] p-[.8rem] px-5 gap-2 rounded-xl 
            hover:bg-[#005bb5] border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] 
            hover:text-white cursor-pointer"
            onClick={handleEditClick}>
          <FontAwesomeIcon icon={faPenClip} className="mr-3" />
          <span>Edit Shift</span>
        </div>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-route-name">
            {route.routeName}
        </div>
        <div className="sidebar-content-header">
          <h3>Route Locations</h3>
          {locations.map((name, index) => (
            <p key={index}>{name}</p>
          ))}
        </div>

        <div className="sidebar-content-header">
          <h3>Date Range</h3>
          <p>{dateRange}</p>
        </div>

        <div className="sidebar-content-header">
          <h3>Days</h3>
          <p>{days}</p>
        </div>

        <div className="sidebar-content-header">
          <h3>Time</h3>
          <p>{timeRange}</p>
        </div>

        <div className="sidebar-content-header">
          <h3 className="margin-bottom-15px">Volunteer(s) Assigned</h3>
          <div className="volunteer-container">
          {Array.from(volunteerMap.entries()).map(([shift, volunteerName]) => (
            <div className="volunteer-item" key={shift._id.toString()}>
              <p className="volunteer-name">{volunteerName}</p>
              <p className="volunteer-period">
                Assigned Period:{" "}
                {formatter.format(new Date(shift.shiftDate))} - {formatter.format(new Date(shift.shiftEndDate))}
                </p>
                <p className="volunteer-period">
                Recurrence:{" "}
                {dayMap[shift.recurrenceRule.split(";")[1].split("=")[1]]}
                </p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyShiftSidebar;
