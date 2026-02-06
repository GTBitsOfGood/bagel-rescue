"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import DashboardHeader from "../../components/DailyDashboard";
import AdminSidebar from "../../../components/AdminSidebar";
import ShiftSidebar, { ShiftSidebarInfo } from "@/app/components/ShiftSidebar";
import { Location } from "@/server/db/models/location";
import { IRoute } from "@/server/db/models/Route";
import { getAllLocationsById } from "@/server/db/actions/location";
import { getRoute } from "@/server/db/actions/Route";
import { deleteShift, getShiftsByDay } from "@/server/db/actions/shift";
import ShiftCard from "../WeeklyShiftDashboard/ShiftCard";
import styles from "@/app/VolunteerNavView/Homepage/page.module.css";
import "../WeeklyShiftDashboard/stylesheet.css";
import { dateToString, getTodayDate, normalizeDate } from "@/lib/dateHandler";
import { Shift } from "@/server/db/models/shift";
import LoadingFallback from "@/app/components/LoadingFallback";

// Filter Icon Component
const FilterIcon = () => (
    <svg
        width="16"
        height="13"
        viewBox="0 0 16 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M0.125 7C0.125 6.83424 0.190848 6.67527 0.308058 6.55806C0.425269 6.44085 0.58424 6.375 0.75 6.375H6.375C6.54076 6.375 6.69973 6.44085 6.81694 6.55806C6.93415 6.67527 7 6.83424 7 7C7 7.16576 6.93415 7.32474 6.81694 7.44195C6.69973 7.55916 6.54076 7.625 6.375 7.625H0.75C0.58424 7.625 0.425269 7.55916 0.308058 7.44195C0.190848 7.32474 0.125 7.16576 0.125 7ZM0.75 2.625H5.125C5.29076 2.625 5.44973 2.55916 5.56694 2.44195C5.68415 2.32473 5.75 2.16576 5.75 2C5.75 1.83424 5.68415 1.67527 5.56694 1.55806C5.44973 1.44085 5.29076 1.375 5.125 1.375H0.75C0.58424 1.375 0.425269 1.44085 0.308058 1.55806C0.190848 1.67527 0.125 1.83424 0.125 2C0.125 2.16576 0.190848 2.32473 0.308058 2.44195C0.425269 2.55916 0.58424 2.625 0.75 2.625ZM11.375 11.375H0.75C0.58424 11.375 0.425269 11.4409 0.308058 11.5581C0.190848 11.6753 0.125 11.8342 0.125 12C0.125 12.1658 0.190848 12.3247 0.308058 12.4419C0.425269 12.5592 0.58424 12.625 0.75 12.625H11.375C11.5408 12.625 11.6997 12.5592 11.8169 12.4419C11.9342 12.3247 12 12.1658 12 12C12 11.8342 11.9342 11.6753 11.8169 11.5581C11.6997 11.4409 11.5408 11.375 11.375 11.375ZM14.9422 3.43282L11.8172 0.307816C11.7591 0.249706 11.6902 0.203606 11.6143 0.172154C11.5385 0.140701 11.4571 0.124512 11.375 0.124512C11.2929 0.124512 11.2115 0.140701 11.1357 0.172154C11.0598 0.203606 10.9909 0.249706 10.9328 0.307816L7.80781 3.43282C7.69054 3.55009 7.62465 3.70915 7.62465 3.875C7.62465 4.04086 7.69054 4.19992 7.80781 4.31719C7.92509 4.43447 8.08415 4.50035 8.25 4.50035C8.41585 4.50035 8.57491 4.43447 8.69219 4.31719L10.75 2.2586V8.25C10.75 8.41576 10.8158 8.57474 10.9331 8.69195C11.0503 8.80916 11.2092 8.875 11.375 8.875C11.5408 8.875 11.6997 8.80916 11.8169 8.69195C11.9342 8.57474 12 8.41576 12 8.25V2.2586L14.0578 4.31719C14.1159 4.37526 14.1848 4.42132 14.2607 4.45275C14.3366 4.48418 14.4179 4.50035 14.5 4.50035C14.5821 4.50035 14.6634 4.48418 14.7393 4.45275C14.8152 4.42132 14.8841 4.37526 14.9422 4.31719C15.0003 4.25912 15.0463 4.19018 15.0777 4.11431C15.1092 4.03844 15.1253 3.95713 15.1253 3.875C15.1253 3.79288 15.1092 3.71156 15.0777 3.63569C15.0463 3.55982 15.0003 3.49088 14.9422 3.43282Z"
            fill="#072B68"
        />
    </svg>
);

function DailyShiftDashboardPage() {
    const [shiftSearchText, setShiftSearchText] = useState("");
    const [date, setDate] = useState<Date>(getTodayDate());
    const [dailyShiftData, setDailyShiftData] = useState([]);
    const [selectedItem, setSelectedItem] = useState<ShiftSidebarInfo | null>(
        null
    );
    const [activeTab, setActiveTab] = useState<"assigned" | "open">("assigned");
    const [shiftToRouteMap, setShiftToRouteMap] = useState<Map<string, IRoute>>(
        new Map()
    );
    const [routeToLocationsMap, setRouteToLocationsMap] = useState<
        Map<string, Location[]>
    >(new Map());
    const [isLoading, setIsLoading] = useState(false);

    const AddDays = (e: number) => {
        const newDate = new Date(date);
        if (newDate.getDate() - new Date().getDate() !== 7 || e === -1) {
            setDailyShiftData([]);
            newDate.setDate(newDate.getDate() + e);
            setDate(newDate);
        }
    };

    const handleDeleteShift = async (shift: Shift) => {
        // You can add confirmation dialog here
        if (confirm("Are you sure you want to delete this shift?")) {
            await deleteShift(shift._id);
            // Can change later to reloading just the array instead of the whole window.
            window.location.reload();
        }
    };

    useEffect(() => {
        setSelectedItem(null)
    }, [isLoading])

    useEffect(() => {
        const fetchDailyShifts = async (targetDate: Date) => {
            try {
                setIsLoading(true)
                const dailyShiftResponse = await getShiftsByDay(targetDate);
                let dailyShiftData = JSON.parse(dailyShiftResponse || "[]");
                dailyShiftData = dailyShiftData.filter((shift: any) => {
                    return !shift.canceledShifts
                        .map((canceledShift: Date) =>
                            dateToString(new Date(canceledShift))
                        )
                        .includes(dateToString(targetDate));
                });
                setDailyShiftData(dailyShiftData);
            } catch (error) {
                console.error("Error fetching shifts:", error);
            } finally {
                setIsLoading(false)
            }
        };

        fetchDailyShifts(date);
    }, [date]);

    // Function to handle shift card click
    const handleShiftCardClick = async (shift: any) => {
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
            shiftDate: new Date(date),
            location_list: formattedLocations,
        });
    };

    const shiftCardsList = () => {
        return dailyShiftData
            .map((shift: any, shiftIndex) => {
                // Filter by status
                const matchesStatus =
                    activeTab === "open"
                        ? shift.status === "open"
                        : shift.status === "assigned";
                if (!matchesStatus) return null;

                return (
                    <ShiftCard
                        key={`${shift["_id"]}-${shiftIndex}`}
                        shift={shift}
                        volunteers={shift["volunteers"] || []}
                        startDate={shift["shiftStartDate"] || ""}
                        endDate={shift["shiftEndDate"] || "--"}
                        startTime={shift["shiftStartTime"] || ""}
                        endTime={shift["shiftEndTime"] || ""}
                        routeName={shift["routeName"] || "--"}
                        locationDescription={shift["locationDescription"] || ""}
                        confirmationForm={
                            Object.keys(shift.confirmationForm).includes(
                                dateToString(normalizeDate(date))
                            )
                                ? shift.confirmationForm[dateToString(date)]
                                : null
                        }
                        returnRoute={"/AdminNavView/DailyShiftDashboard"}
                        recurrenceDates={shift["recurrenceDates"] || []}
                        onDeleteShift={handleDeleteShift}
                        shiftDate={date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                        onOpenSidebar={() => handleShiftCardClick(shift)}
                    />
                );
            })
            .filter(Boolean);
    };

    // Calculate counts for tabs
    const assignedCount = dailyShiftData.filter(
        (shift: any) => shift.status === "assigned"
    ).length;
    const openCount = dailyShiftData.filter(
        (shift: any) => shift.status === "open"
    ).length;

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex flex-col flex-1 relative">
                <DashboardHeader date={date} AddDays={AddDays} />
                <div className="container">
                    <div className="search-settings">
                        <button className="sort-by-btn">
                            <FilterIcon />
                            <p>Sort by</p>
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

                    <div className="flex mt-6">
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "assigned" ? styles.activeTab : ""
                            }`}
                            onClick={() => setActiveTab("assigned")}
                        >
                            Shifts ({assignedCount})
                        </button>
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "open" ? styles.activeTab : ""
                            }`}
                            onClick={() => setActiveTab("open")}
                        >
                            Open Shifts ({openCount})
                        </button>
                    </div>
                    {isLoading ? (
                        <>
                            <LoadingFallback/>
                        </>
                    ) : (
                        <div className="shift-container">{shiftCardsList()}</div>
                    )}
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

export default DailyShiftDashboardPage;
