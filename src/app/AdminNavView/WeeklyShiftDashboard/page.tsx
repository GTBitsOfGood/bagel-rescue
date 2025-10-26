"use client";

import "./stylesheet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpShortWide,
    faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Shift } from "@/server/db/models/shift";
import { getAllShifts, getShiftsByWeek } from "@/server/db/actions/shift";
import { getRoute } from "@/server/db/actions/Route";
import WeeklyDashboardHeader from "../../components/WeeklyDashboard";
import AdminSidebar from "../../../components/AdminSidebar";
import ShiftCard from "./ShiftCard";
import { getShiftUsers } from "@/server/db/actions/userShifts";

import { handleAuthError } from "@/lib/authErrorHandler";
import ShiftSidebar, { ShiftSidebarInfo } from "@/app/components/ShiftSidebar";
import { getAllLocationsById } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";
import { IRoute } from "@/server/db/models/Route";
import { findDayInRange, getWeekRange } from "@/lib/dateRangeHandler";

function WeeklyShiftDashboard() {
    const router = useRouter();
    const [shiftSearchText, setShiftSearchText] = useState("");
    const [shiftsPerRoute, setShiftsPerRoute] = useState<Map<string, Shift[]>>(
        new Map()
    );
    const [selectedItem, setSelectedItem] = useState<ShiftSidebarInfo | null>(
        null
    );
    const [volunteersPerShift, setVolunteersPerShift] = useState<
        Map<string, string>
    >(new Map());
    const [weeklyShiftData, setWeeklyShiftData] = useState([]);
    const [date, setDate] = useState<Date>(new Date());

    const [shiftToRouteMap, setShiftToRouteMap] = useState<Map<string, IRoute>>(
        new Map()
    );
    const [routeToLocationsMap, setRouteToLocationsMap] = useState<
        Map<string, Location[]>
    >(new Map());

    const { startOfWeek, endOfWeek } = getWeekRange(date);

    const AddDays = (e: number) => {
        const newDate = new Date(date);
        // For weekly view, we move by 7 days (1 week) at a time
        newDate.setDate(newDate.getDate() + e);
        setDate(newDate);
    };

    useEffect(() => {
        const fetchWeeklyShifts = async (startDate: Date, endDate: Date) => {
            try {
                const weeklyShiftResponse = await getShiftsByWeek(
                    startDate,
                    endDate
                );
                const weeklyShiftData = JSON.parse(weeklyShiftResponse || "[]");
                console.log("Weekly Shift Data: ", weeklyShiftData);
                setWeeklyShiftData(weeklyShiftData);
            } catch (error) {
                console.error("Error fetching shifts:", error);
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

        fetchShifts();
        fetchWeeklyShifts(startOfWeek, endOfWeek);
    }, [date]);

    useEffect(() => {
        const fetchVolunteers = async () => {
            const shiftIdList = Array.from(shiftsPerRoute.values())
                .flat()
                .map((shift) => shift._id.toString());

            const usersPerShift = await getShiftUsers(shiftIdList);

            const map = new Map<string, string>();
            usersPerShift.forEach((item) => {
                map.set(item.shiftId, item.fullName);
            });

            setVolunteersPerShift(map);
        };

        fetchVolunteers();
    }, [shiftsPerRoute]);

    // Function to handle shift card click
    const handleShiftCardClick = async (shift: any, shiftDate: Date) => {
        let route;
        const routeId = String(shift["routeId"]);

        // Get or fetch route
        if (shiftToRouteMap.has(routeId)) {
            route = shiftToRouteMap.get(routeId);
        } else {
            route = await getRoute(shift["routeId"]);
            if (route) {
                shiftToRouteMap.set(routeId, route);
            }
        }

        if (!route) {
            console.error("Route not found for shift:", shift);
            return;
        }

        // Get or fetch locations
        let locationList;
        if (routeToLocationsMap.has(routeId)) {
            locationList = routeToLocationsMap.get(routeId);
        } else {
            const locationIds = route.locations.map((loc: any) =>
                String(loc.location)
            );
            const locationsData = await getAllLocationsById(locationIds);
            locationList = JSON.parse(locationsData || "[]");
            routeToLocationsMap.set(routeId, locationList);
        }

        const formattedLocations = locationList.map(
            (loc: Location) => `${loc.locationName} - ${loc.area}`
        );

        setSelectedItem({
            shift: shift,
            route: route,
            shiftDate: new Date(shiftDate),
            location_list: formattedLocations,
        });
    };

    // TODO: Can definitely be made more efficient - probably not need
    // to pass entire volunteersPerShift into every Route card
    const routesList = () => {
        return weeklyShiftData.map((shift: any, shiftIndex) => {
            // Early return if no recurrence dates
            if (!shift["recurrenceDates"]?.length) {
                return null;
            }

            // Process only recurrence dates within the week range
            const validShiftCards = shift["recurrenceDates"]
                .map((day: string, dateIndex: number) => {
                    const shiftDate = findDayInRange(
                        day,
                        startOfWeek,
                        endOfWeek
                    );
                    if (!shiftDate) return null;

                    return (
                        <ShiftCard
                            key={`${shift["_id"]}-${dateIndex}-${shiftIndex}`}
                            volunteers={shift["volunteers"] || []}
                            startDate={shift["shiftStartDate"] || ""}
                            endDate={shift["shiftEndDate"] || "--"}
                            startTime={shift["shiftStartTime"] || ""}
                            endTime={shift["shiftEndTime"] || ""}
                            routeName={shift["routeName"] || "--"}
                            locationDescription={
                                shift["locationDescription"] || ""
                            }
                            recurrenceDates={shift["recurrenceDates"] || []}
                            shiftDate={shiftDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                            onOpenSidebar={() =>
                                handleShiftCardClick(shift, shiftDate)
                            }
                        />
                    );
                })
                .filter(Boolean); // Remove null entries

            // Return array of valid shift cards or null if none
            return validShiftCards.length > 0 ? validShiftCards : null;
        });
    };

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex flex-col flex-1 relative">
                <WeeklyDashboardHeader date={date} AddDays={AddDays} />
                <div className="container">
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
                    <div className="shift-container">{routesList()}</div>
                    {selectedItem && (
                        <ShiftSidebar
                            shiftSidebarInfo={selectedItem}
                            onOpenSidebar={() => {
                                setSelectedItem(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default WeeklyShiftDashboard;
