"use client";

import "./stylesheet.css";
import AdminSidebar from "@/components/AdminSidebar";
import { getAllRoutes, getRoutesByShiftId } from "@/server/db/actions/Route";
import { getShiftFromString } from "@/server/db/actions/shift";
import { getAllUsers, getUsersPerShift } from "@/server/db/actions/User";
import { createUserShift } from "@/server/db/actions/userShifts";
import { IRoute } from "@/server/db/models/Route";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import dayToNumber, { dayList } from "@/lib/dayHandler";
import BackButton from "@/app/components/BackButton";

import { updateShift } from "@/server/db/actions/shift";
import {
  deleteUserShift,
  updateUserShiftsRoute,
} from "@/server/db/actions/userShifts";
import { dateToString, stringToDate, toUTCStartOfDay } from "@/lib/dateHandler";
import { errorToast } from "@/lib/toastConfig";

export default function EditShift() {
  const timeStartInputRef = useRef<HTMLInputElement>(null);
  const timeEndInputRef = useRef<HTMLInputElement>(null);
  const [searchRoutes, setSearchRoutes] = useState<IRoute[]>([]);
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [volunteerSearchText, setVolunteerSearchText] = useState<string>("");
  const [searchVolunteers, setSearchVolunteers] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [hasAddedRoute, setHasAddedRoute] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [timeSpecific, setTimeSpecific] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<boolean>(false);
  const [recurringShift, setRecurringShift] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const { shiftId } = useParams<{ shiftId: string }>();
  const router = useRouter();

  const [originalShift, setOriginalShift] = useState<any | null>(null);
  const [originalVolunteers, setOriginalVolunteers] = useState<any[]>([]);
  const [originalRouteId, setOriginalRouteId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const findFirstDateAfterToday = (days: string[]): Date | null => {
    if (days.length === 0) return null;

    const today = toUTCStartOfDay(new Date());
    const currentDay = today.getDay();

    const uniqueDays: { [key: number]: boolean } = {};
    for (const day of days) {
      uniqueDays[dayToNumber[day]] = true;
    }

    const dayNumbers: number[] = [];
    for (const dayNumStr in uniqueDays) {
      dayNumbers.push(parseInt(dayNumStr, 10));
    }

    dayNumbers.sort((a, b) => a - b);

    for (let i = 0; i < dayNumbers.length; i++) {
      if (dayNumbers[i] > currentDay) {
        const result = new Date(today);
        result.setDate(today.getDate() + (dayNumbers[i] - currentDay));
        return result;
      }
    }

    if (dayNumbers.length > 0) {
      const result = new Date(today);
      result.setDate(today.getDate() + (7 - currentDay + dayNumbers[0]));
      return result;
    }

    return null;
  };

  useEffect(() => {
    const getShiftInformation = async () => {
      const shift = await getShiftFromString(shiftId);
      const volunteersData = await getUsersPerShift(shiftId);
      const routeData = await getRoutesByShiftId(shiftId);

      if (shift) {
        const startTimeDate = new Date(shift.shiftStartTime);
        const endTimeDate = new Date(shift.shiftEndTime);

        const formatTimeForInput = (date: Date) => {
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        };

        setStartTime(formatTimeForInput(startTimeDate));
        setEndTime(formatTimeForInput(endTimeDate));
        setTimeSpecific(shift.timeSpecific);
        setAdditionalInfo(shift.additionalInfo || "");
        setSelectedDays(
          (shift.recurrenceDates || []).map((day: string) => day),
        );
        setRecurringShift(!!shift.isRecurring);

        if (shift.shiftStartDate && shift.shiftEndDate) {
          setDateRange(true);
          setStartDate(dateToString(stringToDate(shift.shiftStartDate)));

          if (shift.isRecurring) {
            setEndDate("");
          } else {
            setEndDate(dateToString(stringToDate(shift.shiftEndDate)));
          }
        }

        if (volunteersData.length > 0) {
          setVolunteers(volunteersData);
        }
        if (routeData.length > 0) {
          setRoutes(routeData);
          setHasAddedRoute(true);
        }

        setOriginalShift(shift);
        setOriginalVolunteers(volunteersData || []);
        setOriginalRouteId(
          shift.routeId ?? (routeData && routeData[0]?._id) ?? null,
        );
      }
    };
    getShiftInformation();
  }, [shiftId]);

  useEffect(() => {
    const fetchRoutes = async () => {
      const response = await getAllRoutes();
      const data = JSON.parse(response || "[]");
      setSearchRoutes(data || []);
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchVolunteers = async () => {
      const response = await getAllUsers();
      const data = JSON.parse(response || "[]");
      setSearchVolunteers(data || []);
    };
    fetchVolunteers();
  }, []);

  function idsEqualArray(a: any[], b: any[]) {
    const aIds = (a || [])
      .map((x) => x._id)
      .filter(Boolean)
      .sort();
    const bIds = (b || [])
      .map((x) => x._id)
      .filter(Boolean)
      .sort();
    if (aIds.length !== bIds.length) return false;
    for (let i = 0; i < aIds.length; i++) if (aIds[i] !== bIds[i]) return false;
    return true;
  }

  function daysEqual(a: string[], b: string[]) {
    const norm = (arr: string[]) =>
      (arr || []).map((s) => s.toString().toLowerCase()).sort();
    const A = norm(a);
    const B = norm(b);
    if (A.length !== B.length) return false;
    for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false;
    return true;
  }

  useEffect(() => {
    if (!originalShift) {
      setIsDirty(false);
      return;
    }

    const routeIdCurrent = routes[0]?._id.toString() ?? originalRouteId;

    const timesChanged =
      startTime !==
        (() => {
          const d = new Date(originalShift.shiftStartTime);
          return `${d.getHours().toString().padStart(2, "0")}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        })() ||
      endTime !==
        (() => {
          const d = new Date(originalShift.shiftEndTime);
          return `${d.getHours().toString().padStart(2, "0")}:${d
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
        })();

    const timeSpecificChanged = timeSpecific !== !!originalShift.timeSpecific;
    const dateRangeChanged =
      dateRange !==
      !!(originalShift.shiftStartDate && originalShift.shiftEndDate);
    const recurringChanged = recurringShift !== !!originalShift.isRecurring;
    const startDateChanged =
      startDate !==
      (originalShift.shiftStartDate
        ? new Date(originalShift.shiftStartDate).toISOString().slice(0, 10)
        : "");
    const endDateChanged = recurringShift
      ? false
      : endDate !==
        (originalShift.shiftEndDate
          ? new Date(originalShift.shiftEndDate).toISOString().slice(0, 10)
          : "");
    const additionalInfoChanged =
      additionalInfo !== (originalShift.additionalInfo || "");
    const recurrenceChanged = !daysEqual(
      selectedDays,
      originalShift.recurrenceDates || [],
    );
    const volunteersChanged = !idsEqualArray(volunteers, originalVolunteers);
    const routeChanged = routeIdCurrent !== originalRouteId;

    setIsDirty(
      timesChanged ||
        timeSpecificChanged ||
        dateRangeChanged ||
        recurringChanged ||
        startDateChanged ||
        endDateChanged ||
        additionalInfoChanged ||
        recurrenceChanged ||
        volunteersChanged ||
        routeChanged,
    );
  }, [
    startTime,
    endTime,
    timeSpecific,
    dateRange,
    recurringShift,
    startDate,
    endDate,
    additionalInfo,
    selectedDays,
    volunteers,
    routes,
    originalShift,
    originalVolunteers,
    originalRouteId,
  ]);

  function addRoute(index: number): void {
    const newRoutes = [...routes];
    newRoutes.push(searchRoutes[index]);
    setRoutes(newRoutes);

    const newSearchRoutes = [...searchRoutes];
    newSearchRoutes.splice(index, 1);
    setSearchRoutes(newSearchRoutes);

    setHasAddedRoute(true);
  }

  function removeRoute(index: number): void {
    const newSearchRoutes = [...searchRoutes];
    newSearchRoutes.push(routes[index]);
    setSearchRoutes(newSearchRoutes);

    const newRoutes = [...routes];
    newRoutes.splice(index, 1);
    setRoutes(newRoutes);

    setHasAddedRoute(false);
  }

  function addVolunteer(index: number): void {
    setVolunteers([...volunteers, searchVolunteers[index]]);

    const newSearchVolunteers = [...searchVolunteers];
    newSearchVolunteers.splice(index, 1);
    setSearchVolunteers(newSearchVolunteers);

    setVolunteerSearchText("");
  }

  function removeVolunteer(index: number): void {
    const newSearchVolunteers = [...searchVolunteers];
    newSearchVolunteers.push(volunteers[index]);
    setSearchVolunteers(newSearchVolunteers);

    const newVolunteers = [...volunteers];
    newVolunteers.splice(index, 1);
    setVolunteers(newVolunteers);
  }

  function selectedRoute() {
    if (routes.length === 0) return null;

    return (
      <div className="selected-route">
        <div className="route-info justify-between">
          <div className="flex flex-col gap-2">
            <p className="route-name">{routes[0]["routeName"]}</p>
            <p className="route-description">
              {routes[0]["locationDescription"]}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="route-description">
            {routes[0]["locations"].length} stops
          </p>
        </div>
        <button className="x-btn" onClick={() => removeRoute(0)}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    );
  }

  function searchRoutesList() {
    return (
      <div
        className="search-results-list"
        style={{ display: hasAddedRoute ? "none" : "flex" }}
      >
        {searchRoutes.map((route, ind) => {
          return (
            <div
              key={ind}
              className="search-result"
              onClick={() => addRoute(ind)}
              style={{
                display:
                  searchText === "" ||
                  route["routeName"]
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                    ? "flex"
                    : "none",
              }}
            >
              <div className="search-location-section">
                <p className="search-result-name">{route["routeName"]}</p>
                <p className="search-location-address">
                  {route["locationDescription"]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function searchVolunteersList() {
    return (
      <div className="search-results-list bg-white">
        {searchVolunteers.map((volunteer, ind) => {
          return (
            <div
              key={ind}
              className="volunteer-search-result"
              onClick={() => addVolunteer(ind)}
              style={{
                display:
                  volunteerSearchText === "" ||
                  `${volunteer.firstName} ${volunteer.lastName}`
                    .toLowerCase()
                    .includes(volunteerSearchText.toLowerCase())
                    ? "flex"
                    : "none",
              }}
            >
              <p className="volunteer-search-result-name">
                {volunteer.firstName} {volunteer.lastName}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  function selectedVolunteersList() {
    return (
      <div className="selected-volunteers-list">
        {volunteers.map((volunteer, index) => (
          <div key={index} className="selected-volunteer">
            <div className="selected-volunteer-name">
              {volunteer.firstName} {volunteer.lastName}
            </div>
            <button className="x-btn" onClick={() => removeVolunteer(index)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Type to search..."
          value={volunteerSearchText}
          onChange={(e) => setVolunteerSearchText(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "0.5em",
            fontSize: "1em",
            minWidth: "150px",
          }}
        />
      </div>
    );
  }

  const handleClick = () => {
    if (timeStartInputRef.current) {
      timeStartInputRef.current.showPicker
        ? timeStartInputRef.current.showPicker()
        : timeStartInputRef.current.focus();
    }
  };

  const handleClickEnd = () => {
    if (timeEndInputRef.current) {
      timeEndInputRef.current.showPicker
        ? timeEndInputRef.current.showPicker()
        : timeEndInputRef.current.focus();
    }
  };

  function timeIntoHoursandMinutes(inputTime: string): [number, number] {
    const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
    const match = inputTime.match(timeRegex);

    if (!match) return [0, 0];

    const [, hourStr, minuteStr] = match;
    const hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    return [hours, minutes];
  }

  async function saveEdits() {
    if (!originalShift) {
      errorToast("Original shift data not loaded.");
      return;
    }

    if (!startTime.trim()) {
      errorToast("Please enter a start time.");
      return;
    }
    if (!endTime.trim()) {
      errorToast("Please enter an end time.");
      return;
    }
    if (dateRange) {
      if (!startDate.trim()) {
        errorToast("Please enter a start date.");
        return;
      }
      if (!recurringShift && !endDate.trim()) {
        errorToast("Please enter an end date.");
        return;
      }
    }
    if (routes.length === 0) {
      errorToast("Please add a route.");
      return;
    }
    if (volunteers.length === 0) {
      errorToast("Please add at least one volunteer.");
      return;
    }
    if (selectedDays.length === 0) {
      errorToast("Please select at least one day.");
      return;
    }

    const selectedRouteId = routes[0]._id.toString();
    const [startHour, startMinute] = timeIntoHoursandMinutes(startTime);
    const [endHour, endMinute] = timeIntoHoursandMinutes(endTime);

    if (
      (startHour === 0 && startMinute === 0) ||
      (endHour === 0 && endMinute === 0) ||
      endHour < startHour ||
      (endHour === startHour && endMinute <= startMinute)
    ) {
      errorToast("Please enter valid times.");
      return;
    }

    const targetDays = selectedDays.map((d) => d.toLowerCase());

    const startTimeAsDate = new Date("1970-01-01T09:00:00.000Z");
    startTimeAsDate.setHours(startHour);
    startTimeAsDate.setMinutes(startMinute);
    startTimeAsDate.setSeconds(0);

    const endTimeAsDate = new Date("1970-01-01T09:00:00.000Z");
    endTimeAsDate.setHours(endHour);
    endTimeAsDate.setMinutes(endMinute);
    endTimeAsDate.setSeconds(0);

    let finalStartDate: Date;
    let finalEndDate: Date;
    let isRecurring = false;

    if (!dateRange) {
      finalStartDate = findFirstDateAfterToday(targetDays)!;
      finalEndDate = new Date(finalStartDate);
      finalEndDate.setFullYear(finalEndDate.getFullYear() + 5);
      isRecurring = true;
    } else {
      finalStartDate = stringToDate(startDate);
      isRecurring = recurringShift;

      if (!isRecurring) {
        finalEndDate = stringToDate(endDate);
        if (finalEndDate < finalStartDate) {
          errorToast("End date cannot be before start date.");
          return;
        }
      } else {
        finalEndDate = new Date(finalStartDate);
        finalEndDate.setFullYear(finalEndDate.getFullYear() + 5);
      }
    }

    const shiftUpdatePayload: any = {
      routeId: selectedRouteId,
      shiftStartTime: startTimeAsDate,
      shiftEndTime: endTimeAsDate,
      shiftStartDate: dateToString(finalStartDate),
      shiftEndDate: dateToString(finalEndDate),
      recurrenceDates: targetDays,
      timeSpecific: !!timeSpecific,
      additionalInfo: additionalInfo ?? "",
      currSignedUp: volunteers.length,
      isRecurring,
    };

    const origIds = (originalVolunteers || []).map((v) => v._id);
    const currIds = (volunteers || []).map((v) => v._id);

    const addedVolunteerObjects = volunteers.filter(
      (v) => !origIds.includes(v._id),
    );
    const removedVolunteerObjects = originalVolunteers.filter(
      (v) => !currIds.includes(v._id),
    );

    try {
      const updateResult = await updateShift(
        shiftId,
        JSON.stringify(shiftUpdatePayload),
      );
      if (!updateResult) throw new Error("Failed to update shift");

      for (const v of removedVolunteerObjects) {
        try {
          await deleteUserShift(v._id.toString(), shiftId);
        } catch (err) {
          console.warn("Failed to delete userShift for", v._id, err);
        }
      }

      for (const v of addedVolunteerObjects) {
        try {
          await createUserShift({
            userId: v._id,
            shiftId: shiftId,
            routeId: selectedRouteId,
            recurrenceDates: targetDays,
            shiftDate: finalStartDate,
            shiftEndDate: finalEndDate,
            isRecurring,
          });
        } catch (err) {
          console.warn("Failed to create userShift for", v._id, err);
        }
      }

      if (
        originalRouteId &&
        selectedRouteId &&
        selectedRouteId !== originalRouteId
      ) {
        try {
          await updateUserShiftsRoute(shiftId, selectedRouteId);
        } catch (err) {
          console.warn(
            "Failed to update userShifts routeId for shift",
            shiftId,
            err,
          );
        }
      }

      setOriginalShift({ ...originalShift, ...shiftUpdatePayload });
      setOriginalVolunteers([...volunteers]);
      setOriginalRouteId(selectedRouteId);
      setIsDirty(false);

      router.push("/AdminNavView/DailyShiftDashboard");
    } catch (error) {
      console.error("Error updating shift or user shifts:", error);
      errorToast("Error saving changes. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col w-full min-h-screen">
        <div className="flex flex-col p-4 space-y-2 border border-b-[#D3D8DE]">
          <BackButton
            onClick={() => router.push("/AdminNavView/DailyShiftDashboard")}
          />
          <div className="flex justify-between text-center align-middle">
            <div className="text-[#072B68] font-bold text-4xl content-center">
              Edit Shift
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => saveEdits()}
                className="font-bold text-white px-6 py-[.8rem] rounded-xl text-base"
                style={{ backgroundColor: isDirty ? "#0F7AFF" : "#A3A3A3" }}
                disabled={!isDirty}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-8 px-16 bg-white space-x-16 flex-grow">
          <div className="h-full w-full flex space-x-16 pb-6">
            <div className="flex flex-col space-y-6 w-2/5">
              <div className="flex space-x-12">
                <div className="flex flex-col space-y-2 flex-1">
                  <p className="text-[#072B68] font-bold text-lg">
                    Start Time <span className="text-red-500">*</span>
                  </p>
                  <input
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    ref={timeStartInputRef}
                    onClick={() => handleClick()}
                    className="px-4 py-[.8rem] rounded-lg border border-blue-600 h-full text-gray-500"
                    type="time"
                  />
                </div>
                <div className="flex flex-col space-y-2 flex-1">
                  <p className="text-[#072B68] font-bold text-lg">
                    End Time <span className="text-red-500">*</span>
                  </p>
                  <input
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    ref={timeEndInputRef}
                    onClick={() => handleClickEnd()}
                    className="px-4 py-[.8rem] rounded-lg border border-blue-600 h-full text-gray-500"
                    type="time"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex flex-row gap-2 items-center">
                  <label
                    className="text-[#072B68] font-bold text-lg"
                    htmlFor="timeSpecific"
                  >
                    Time Specific?
                  </label>
                  <input
                    type="checkbox"
                    id="timeSpecific"
                    className="w-5 h-5 border-2 border-blue-500 rounded"
                    checked={timeSpecific}
                    onChange={() => setTimeSpecific(!timeSpecific)}
                  />
                </div>
                <p className="text-[#072B68] text-sm">
                  This shift must be done exactly within this timeframe
                </p>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex flex-row gap-2 items-center">
                  <p className="text-[#072B68] font-bold text-lg">
                    Date Range?
                  </p>
                  <input
                    type="checkbox"
                    id="dateRange"
                    className="w-5 h-5 border-2 border-blue-500 rounded"
                    checked={dateRange}
                    onChange={() => {
                      const next = !dateRange;
                      setDateRange(next);
                      if (!next) {
                        setRecurringShift(false);
                        setEndDate("");
                      }
                    }}
                  />
                </div>

                <div className="flex flex-row gap-2 items-center">
                  <p className="text-[#072B68] font-bold text-lg">
                    Recurring Shift
                  </p>
                  <input
                    type="checkbox"
                    id="recurringShift"
                    disabled={!dateRange}
                    className="w-5 h-5 border-2 border-blue-500 rounded"
                    checked={recurringShift}
                    onChange={() => {
                      if (!dateRange) return;
                      const next = !recurringShift;
                      setRecurringShift(next);
                      if (next) {
                        setEndDate("");
                      }
                    }}
                  />
                </div>

                <div className="flex space-x-12">
                  <div className="flex flex-col space-y-2 flex-1">
                    <p
                      className={`font-bold text-lg ${
                        dateRange ? "label-enabled" : "label-disabled"
                      }`}
                    >
                      Start Date <span className="text-red-500">*</span>
                    </p>
                    <input
                      className={`px-4 py-[.8rem] rounded-lg h-full ${
                        dateRange ? "date-input-enabled" : "date-input-disabled"
                      }`}
                      type="date"
                      value={startDate}
                      disabled={!dateRange}
                      onChange={(e) =>
                        dateRange ? setStartDate(e.target.value) : null
                      }
                      onClick={(e) => !dateRange && e.preventDefault()}
                    />
                  </div>

                  <div className="flex flex-col space-y-2 flex-1">
                    <p
                      className={`font-bold text-lg ${
                        dateRange && !recurringShift
                          ? "label-enabled"
                          : "label-disabled"
                      }`}
                    >
                      End Date <span className="text-red-500">*</span>
                    </p>
                    <input
                      className={`px-4 py-[.8rem] rounded-lg h-full ${
                        dateRange && !recurringShift
                          ? "date-input-enabled"
                          : "date-input-disabled"
                      }`}
                      type="date"
                      value={endDate}
                      disabled={!dateRange || recurringShift}
                      onChange={(e) =>
                        dateRange && !recurringShift
                          ? setEndDate(e.target.value)
                          : null
                      }
                      onClick={(e) =>
                        (!dateRange || recurringShift) && e.preventDefault()
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="day"
                  className="text-[#072B68] font-bold text-lg"
                >
                  Day(s)<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex justify-between">
                  {dayList.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDays(
                              selectedDays.filter((d) => d !== day),
                            );
                          } else {
                            setSelectedDays([...selectedDays, day]);
                          }
                        }}
                        className={`w-14 h-14 rounded-full border border-[#0F7AFF] ${
                          isSelected
                            ? "bg-[#0F7AFF] text-white"
                            : "bg-white text-[#072B68] hover:bg-gray-100"
                        }`}
                      >
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="volunteer"
                  className="text-[#072B68] font-bold text-lg"
                >
                  Volunteer<span className="text-red-500 ml-1">*</span>
                </label>
                {selectedVolunteersList()}
              </div>
              {searchVolunteersList()}
            </div>

            <div className="flex flex-col justify-start w-3/5 space-y-2">
              <p className="text-[#072B68] font-bold text-lg">
                Route<span className="text-red-500 ml-1">*</span>
              </p>
              <div className="flex flex-col justify-between px-4 py-[.8rem] rounded-xl border border-[#57A0D5] bg-white">
                <div className="route-box">
                  {hasAddedRoute ? (
                    selectedRoute()
                  ) : (
                    <div className="route-input">
                      <input
                        className="field-input"
                        type="text"
                        placeholder="Start typing here"
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                  )}
                  {searchRoutesList()}
                </div>
              </div>

              <p className="text-[#072B68] font-bold text-lg">
                Additional Information
              </p>
              <textarea
                value={additionalInfo}
                className="additional-info-textarea"
                placeholder="Enter additional information here"
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
