'use client'

import "./stylesheet.css";
import AdminSidebar from "@/components/AdminSidebar";
import { getAllLocationsById } from "@/server/db/actions/location";
import { getAllRoutes } from "@/server/db/actions/Route";
import { createShift } from "@/server/db/actions/shift";
import { getAllUsers } from "@/server/db/actions/User";
import { createUserShift } from "@/server/db/actions/userShifts";
import { Location } from "@/server/db/models/location";
import { IRoute } from "@/server/db/models/Route";
import { faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import dayToNumber from "@/lib/dayHandler";

export default function NewShiftPage() {
    const timeStartInputRef = useRef<HTMLInputElement>(null);
    const timeEndInputRef = useRef<HTMLInputElement>(null);
    const [searchRoutes, setSearchRoutes] = useState<IRoute[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [volunteerSearchText, setVolunteerSearchText] = useState<string>("");
    const [searchVolunteers, setSearchVolunteers] = useState<any[]>([]);
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [isSearchingVolunteers, setIsSearchingVolunteers] = useState<boolean>(false);
    const [hasAddedRoute, setHasAddedRoute] = useState<boolean>(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [timeSpecific, setTimeSpecific] = useState<boolean>(false);
    const [dateRange, setDateRange] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [additionalInfo, setAdditionalInfo] = useState<string>("");

    const router = useRouter();
    

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

  useEffect(() => {
    const fetchLocations = async () => {
      if (routes.length === 0) return;
      const response = await getAllLocationsById(routes[0].locations.map((loc) => String(loc.location)));
      const data = JSON.parse(response || "[]");
      setLocations(data || []);
    };
    fetchLocations();
  }, [routes]);

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
    setIsSearchingVolunteers(false);
  }

  function removeVolunteer(index: number): void {
    const newSearchVolunteers = [...searchVolunteers];
    newSearchVolunteers.push(volunteers[index]);
    setSearchVolunteers(newSearchVolunteers);

    const newVolunteers = [...volunteers];
    newVolunteers.splice(index, 1);
    setVolunteers(newVolunteers);
  }

  function locationsList() {
    if (locations.length === 0) return <div></div>;
    return locations.map((loc) => {
        return (
            <div key={loc._id} className="content-center bg-blue-300 px-2 rounded-lg mr-2">
            <p className="text-[#072B68] font-bold text-xs content-center">{loc["locationName"]}</p>
            </div>
        );
    }
    );
  }


  function selectedRoute() {
    if (routes.length === 0) return null;
    
    return (
      <div className="selected-route">
        <div className="route-info justify-between">
          <div className="flex flex-col gap-2">
          <p className="route-name">{routes[0]["routeName"]}</p>
          <p className="route-description">{routes[0]["locationDescription"]}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
            <p className="route-description">{routes[0]["locations"].length} stops</p>
        </div>
        <button
          className="x-btn"
          onClick={() => removeRoute(0)}
        >
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
                display: searchText === "" || route["routeName"]
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
                  ? "flex"
                  : "none",
              }}
            >
              <div className="search-location-section">
                <p className="search-result-name">
                  {route["routeName"]}
                </p>
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
                display: volunteerSearchText === "" || `${volunteer.firstName} ${volunteer.lastName}`
                  .toLowerCase()
                  .includes(volunteerSearchText.toLowerCase())
                  ? "flex"
                  : "none",
              }}
            >
              <p className="volunteer-search-result-name">{volunteer.firstName} {volunteer.lastName}</p>
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
            <button
              className="x-btn"
              onClick={() => removeVolunteer(index)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Type to search..."
          value={volunteerSearchText}
          onChange={(e) => setVolunteerSearchText(e.target.value)}
          onClick={() => setIsSearchingVolunteers(true)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '0.5em',
            fontSize: '1em',
            minWidth: '150px'
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

    if (!match) return [0,0]

    let [, hourStr, minuteStr, meridiem] = match;

    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    return [hours, minutes];
  }

  const findFirstDateAfterToday = (days: string[]): Date | null => {
    if (days.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const currentDay = today.getDay();
    
    // Remove duplicates and convert to numbers
    const uniqueDays: {[key: number]: boolean} = {};
    for (const day of days) {
      uniqueDays[dayToNumber[day]] = true;
    }
    
    const dayNumbers: number[] = [];
    for (const dayNumStr in uniqueDays) {
      dayNumbers.push(parseInt(dayNumStr, 10));
    }
    
    dayNumbers.sort((a, b) => a - b);
    
    // Find the first day after today
    for (let i = 0; i < dayNumbers.length; i++) {
      if (dayNumbers[i] > currentDay) {
        const result = new Date(today);
        result.setDate(today.getDate() + (dayNumbers[i] - currentDay));
        return result;
      }
    }
    
    // If no day found after today, return the first day of next week
    if (dayNumbers.length > 0) {
      const result = new Date(today);
      result.setDate(today.getDate() + (7 - currentDay + dayNumbers[0]));
      return result;
    }
    
    return null;
  };

  async function saveEdits() {

    // Validate required fields marked with asterisks
    if (!startTime.trim()) {
      alert("Please enter a start time.");
      return;
    }
    
    if (!endTime.trim()) {
      alert("Please enter an end time.");
      return;
    }
    
    if (dateRange) {
      if (!startDate.trim()) {
        alert("Please enter a start date.");
        return;
      }
      
      if (!endDate.trim()) {
        alert("Please enter an end date.");
        return;
      }
    }
    
    if (routes.length === 0) {
      alert("Please add a route.");
      return;
    }
    
    if (volunteers.length === 0) {
      alert("Please add at least one volunteer.");
      return;
    }
    
    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }
    
    const selectedRoute = routes[0]._id;

    const [startHour, startMinute] = timeIntoHoursandMinutes(startTime);
    const [endHour, endMinute] = timeIntoHoursandMinutes(endTime);
    const startTimeAsDate = new Date("1970-01-01T09:00:00.000Z");
    startTimeAsDate.setHours(startHour);
    startTimeAsDate.setMinutes(startMinute);
    startTimeAsDate.setSeconds(0);

    const endTimeAsDate = new Date("1970-01-01T09:00:00.000Z");
    endTimeAsDate.setHours(endHour);
    endTimeAsDate.setMinutes(endMinute);
    endTimeAsDate.setSeconds(0);
    
    const targetDay = selectedDays.map((day) => day.toLowerCase());
    let finalStartDay = new Date(); 
    let finalEndDay = new Date();

    if (startHour === 0 && startMinute === 0 || 
        endHour === 0 && endMinute === 0 || 
        endHour < startHour || 
        (endHour === startHour && endMinute <= startMinute)) {
      alert("Please enter a valid start time.");
      return;
    }

    if (!dateRange) {
      finalStartDay = findFirstDateAfterToday(targetDay)!;
      finalEndDay = new Date(finalStartDay); 
      finalEndDay.setFullYear(finalEndDay.getFullYear() + 5);
    } else {
      finalStartDay = new Date(startDate);
      finalEndDay = new Date(endDate);
    }

    // TODO: remove
    finalStartDay.setHours(startHour);
    finalStartDay.setMinutes(startMinute);
    finalStartDay.setSeconds(0);

    // TODO: remove
    finalEndDay.setHours(endHour);
    finalEndDay.setMinutes(endMinute);
    finalEndDay.setSeconds(0);

    const newShift = {
      routeId: selectedRoute,
      shiftStartTime: startTimeAsDate,
      shiftEndTime: endTimeAsDate,
      shiftStartDate: finalStartDay,
      shiftEndDate: finalEndDay,
      recurrenceDates: targetDay,
      timeSpecific: timeSpecific ?? false,
      confirmationForm: {},
      canceledShifts: [],
      comments: {},
      capacity: 0,
      creationDate: new Date(),
      additionalInfo: additionalInfo ?? "",
      currSignedUp: volunteers.length,
    };

    var shiftCreationComplete = false;
    
    try {
      // Create the shift first
      const shiftResult = await createShift(JSON.stringify(newShift));
      if (!shiftResult) {
        throw new Error("Failed to create shift");
      }
      const shiftData = JSON.parse(shiftResult!);
      const shiftId = shiftData._id;
      const routeId = shiftData.routeId;

      // Create UserShift records for each volunteer
      for (const volunteer of volunteers) {
        await createUserShift({
          userId: volunteer._id,
          shiftId: shiftId,
          routeId: routeId,
          recurrenceDates: targetDay,
          shiftDate: finalStartDay,
          shiftEndDate: finalEndDay
        });
      }

      shiftCreationComplete = true;
    } catch (error) {
      console.error("Error creating shift or user shifts:", error);
      alert("Error creating shift. Please try again.");
      return;
    } finally {
      if (shiftCreationComplete) {
        router.push("/AdminNavView/DailyShiftDashboard");
      }
    }

    alert("Shift(s) created successfully.");
  }


    
    return (
        <div className="flex min-h-screen">
            <AdminSidebar/>
            <div className="flex flex-col w-full min-h-screen">
              {/* this is the top bar */}
                <div className="flex flex-col p-4 space-y-2 border border-b-[#D3D8DE]">
                    <div onClick={() => router.push("/AdminNavView/DailyShiftDashboard")} className="flex space-x-2 cursor-pointer">
                        <FontAwesomeIcon  icon={faArrowLeft} className="text-[#6C7D93] size-5 mt-[.1rem]"/>
                        <span className="font-semibold text-base text-[#6C7D93]">Back</span>
                    </div>
                    <div className="flex justify-between text-center align-middle">
                        <div className="text-[#072B68] font-bold text-4xl content-center">New Shift</div>
                        <div className="flex justify-end">
                            <button onClick={() => saveEdits()} className="font-bold text-white px-6 py-[.8rem] rounded-xl text-base" style={{backgroundColor: '#A3A3A3'}}>Complete Shift</button>
                        </div>
                    </div>
                </div>

                {/* main content area */}
                <div className="flex justify-between pt-8 px-16 bg-white space-x-16 flex-grow">
                    <div className="h-full w-full flex space-x-16 pb-6">
                        {/* this is the left side of the main content area */}
                        <div className="flex flex-col space-y-6 w-2/5">
                            {/* this is the time input area */}
                            <div className="flex space-x-12">
                              <div className="flex flex-col space-y-2 flex-1">
                                  <p className="text-[#072B68] font-bold text-lg">Start Time <span className="text-red-500">*</span></p>
                                  <input onChange={(e) => setStartTime(e.target.value)} ref={timeStartInputRef} onClick={() => handleClick()} className="px-4 py-[.8rem] rounded-lg border border-blue-600 h-full text-gray-500" type="time" placeholder="Enter additional information here"/>
                              </div>
                              <div className="flex flex-col space-y-2 flex-1">
                                <p className="text-[#072B68] font-bold text-lg">End Time <span className="text-red-500">*</span></p>
                                <input onChange={(e) => setEndTime(e.target.value)} ref={timeEndInputRef} onClick={() => handleClickEnd()} className="px-4 py-[.8rem] rounded-lg border border-blue-600 h-full text-gray-500" type="time" placeholder="Enter additional information here"/>
                              </div>
                            </div>
                            {/* this is the time specific area */}
                            <div className="flex flex-col space-y-2">
                              <div className="flex flex-row gap-2 items-center">
                                <label className="text-[#072B68] font-bold text-lg" htmlFor="timeSpecific">Time Specific?</label>
                                <input type="checkbox" id="timeSpecific" className="w-5 h-5 border-2 border-blue-500 rounded" checked={timeSpecific} onChange={() => setTimeSpecific(!timeSpecific)}></input>
                              </div>
                              <p className="text-[#072B68] text-sm">This shift must be done exactly within this timeframe</p>
                            </div>
                            {/* this is the date range area */}
                            <div className="flex flex-col space-y-4">
                              <div className="flex flex-row gap-2 items-center">
                                <p className="text-[#072B68] font-bold text-lg">Date Range?</p>
                                <input type="checkbox" id="dateRange" className="w-5 h-5 border-2 border-blue-500 rounded" checked={dateRange} onChange={() => setDateRange(!dateRange)}></input>
                              </div>
                              <div className="flex space-x-12">
                                <div className="flex flex-col space-y-2 flex-1">
                                    <p className={`font-bold text-lg ${dateRange ? 'label-enabled' : 'label-disabled'}`}>
                                      Start Date <span className="text-red-500">*</span>
                                    </p>
                                    <input 
                                      className={`px-4 py-[.8rem] rounded-lg h-full ${dateRange ? 'date-input-enabled' : 'date-input-disabled'}`} 
                                      type="date" 
                                      placeholder="Enter additional information here" 
                                      value={startDate}
                                      onChange={(e) => dateRange ? setStartDate(e.target.value) : null}
                                      onClick={(e) => !dateRange && e.preventDefault()}
                                    />
                                </div>
                                <div className="flex flex-col space-y-2 flex-1">
                                  <p className={`font-bold text-lg ${dateRange ? 'label-enabled' : 'label-disabled'}`}>
                                    End Date <span className="text-red-500">*</span>
                                  </p>
                                  <input 
                                    className={`px-4 py-[.8rem] rounded-lg h-full ${dateRange ? 'date-input-enabled' : 'date-input-disabled'}`} 
                                    type="date" 
                                    placeholder="Enter additional information here" 
                                    value={endDate}
                                    onChange={(e) => dateRange ? setEndDate(e.target.value) : null}
                                    onClick={(e) => !dateRange && e.preventDefault()}
                                  />
                                </div>
                              </div>
                            </div>
                             {/* this is the shift day area */}
                             <div className="flex flex-col space-y-2">
                                 <label htmlFor="day" className="text-[#072B68] font-bold text-lg">Day(s)<span className="text-red-500 ml-1">*</span></label>
                                  <div className="flex justify-between">
                                     {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, index) => {
                                         const isSelected = selectedDays.includes(day);
                                         return (
                                             <button
                                                 key={day}
                                                 type="button"
                                                 onClick={() => {
                                                     if (isSelected) {
                                                         setSelectedDays(selectedDays.filter(d => d !== day));
                                                     } else {
                                                         setSelectedDays([...selectedDays, day]);
                                                     }
                                                 }}
                                                 className={`w-14 h-14 rounded-full border border-[#0F7AFF] ${
                                                     isSelected 
                                                         ? 'bg-[#0F7AFF] text-white' 
                                                         : 'bg-white text-[#072B68] hover:bg-gray-100'
                                                 }`}
                                             >
                                                 {day}
                                             </button>
                                         );
                                     })}
                                 </div>
                             </div>
                             {/* this is the volunteer area */}
                             <div className="flex flex-col space-y-2">
                                 <label htmlFor="volunteer" className="text-[#072B68] font-bold text-lg">Volunteer<span className="text-red-500 ml-1">*</span></label>
                                 {selectedVolunteersList()}
                             </div>
                             {searchVolunteersList()}
                        </div>
                        {/* this is the right side of the main content area */}
                        <div className="flex flex-col justify-start w-3/5 space-y-2">
                            {/* this is the route area */}
                            <p className="text-[#072B68] font-bold text-lg">Route<span className="text-red-500 ml-1">*</span></p>
                            <div className="flex flex-col justify-between px-4 py-[.8rem] rounded-xl border border-[#57A0D5] bg-white">
                                    <div className="route-box">
                                        {hasAddedRoute ? selectedRoute() : (
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
                            {/* this is the additional information area */}
                            <p className="text-[#072B68] font-bold text-lg">Additional Information</p>
                            <textarea
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