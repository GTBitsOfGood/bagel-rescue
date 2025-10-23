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
                const weeklyShiftResponse = await getShiftsByWeek(
                    startDate,
                    endDate
                );
                const weeklyShiftData = JSON.parse(weeklyShiftResponse || "[]");
                console.log(weeklyShiftData);
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

        const { startOfWeek, endOfWeek } = getWeekRange(date);
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

    // TODO: Can definitely be made more efficient - probably not need
    // to pass entire volunteersPerShift into every Route card
    function routesList() {
        return weeklyShiftData.map((shift, index) => {
            return (
                <ShiftCard
                    key={shift["_id"] || index}
                    volunteers={shift["volunteers"] || []}
                    startDate={shift["shiftStartDate"] || ""}
                    endDate={shift["shiftEndDate"] || "--"}
                    startTime={shift["shiftStartTime"] || ""}
                    endTime={shift["shiftEndTime"] || ""}
                    routeName={shift["routeName"] || "--"}
                    locationDescription={shift["locationDescription"] || ""}
                    recurrenceDates={shift["recurrenceDates"] || []}
                    onOpenSidebar={async () => {
                        let route;
                        if (shiftToRouteMap.has(String(shift["routeId"]))) {
                            route = shiftToRouteMap.get(
                                String(shift["routeId"])
                            );
                        } else {
                            console.log("Searching!!!");
                            route = await getRoute(shift["routeId"]);
                            shiftToRouteMap.set(
                                String(shift["routeId"]),
                                route!
                            );
                        }

                        let location_list_raw;
                        if (routeToLocationsMap.has(String(shift["routeId"])))
                            location_list_raw = JSON.stringify(
                                routeToLocationsMap.get(
                                    String(shift["routeId"])
                                )
                            );
                        else {
                            console.log("Searching!!!");
                            location_list_raw = await getAllLocationsById(
                                route!.locations.map((loc) =>
                                    String(loc.location)
                                )
                            );
                            routeToLocationsMap.set(
                                String(shift["routeId"]),
                                JSON.parse(location_list_raw || "[]")
                            );
                        }

                        const location_list = JSON.parse(
                            location_list_raw || "[]"
                        ).map(
                            (loc: Location) =>
                                loc.locationName + " - " + loc.area
                        );

                        setSelectedItem({
                            shift: shift,
                            route: route!,
                            location_list: location_list,
                        });
                    }}
                />
            );
        });
    }

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