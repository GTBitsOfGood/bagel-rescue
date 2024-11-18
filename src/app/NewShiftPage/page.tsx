'use client'

import "./stylesheet.css";
import Sidebar from "@/components/Sidebar";
import { getAllLocationById } from "@/server/db/actions/location";
import { createRoute, getAllRoutes, getLocations } from "@/server/db/actions/Route";
import { createShift } from "@/server/db/actions/shift";
import { Location } from "@/server/db/models/location";
import { IRoute } from "@/server/db/models/Route";
import { Shift } from "@/server/db/models/shift";
import { regular } from "@fortawesome/fontawesome-svg-core/import.macro";
import { faArrowLeft, faGripVertical, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ObjectId } from "mongoose";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";


export default function NewShiftPage() {
    const timeStartInputRef = useRef<HTMLInputElement>(null);
    const timeEndInputRef = useRef<HTMLInputElement>(null);
    const [searchRoutes, setSearchRoutes] = useState<IRoute[]>([]);
    const [routes, setRoutes] = useState<IRoute[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [isAddingRoute, setIsAddingRoute] = useState<boolean>(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [day, setDay] = useState<string>("Monday");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [routesIsPickUp, setRoutesIsPickUp] = useState<
    Map<string, boolean>
  >(new Map());

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
    const fetchLocations = async () => {
      if (routes.length === 0) return;
      const response = await getAllLocationById(routes[0].locations.map((loc) => String(loc.location)));
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

    setIsAddingRoute(!isAddingRoute);
  }

  function removeRoute(index: number): void {
    const newSearchRoutes = [...searchRoutes];
    newSearchRoutes.push(routes[index]);
    setSearchRoutes(newSearchRoutes);

    const newRoutes = [...routes];
    newRoutes.splice(index, 1);
    setRoutes(newRoutes);
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


  function routesCards() {
    function handleOnDragEnd(result: any) {
      if (!result.destination) return;

      const items = Array.from(routes);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setRoutes(items);
    }

    return (
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="location-cards-list">
          {(provided) => (
            <div
              className="location-cards-list"
              style={{
                display: isAddingRoute
                  ? "none"
                  : routes.length > 0
                  ? "flex"
                  : "none",
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {routes.map((route, ind) => {
                return (
                  <Draggable
                    key={route["routeName"]}
                    draggableId={route["routeName"]}
                    index={ind}
                  >
                    {(provided) => (
                      <div
                        key={ind}
                        className={route["routeName"] + " location-card"}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div className="location-card-section">
                          <FontAwesomeIcon
                            icon={faGripVertical}
                            className="drag-drop-icon"
                          />
                          <p className="location-number">{ind + 1}</p>
                          <p className="location-name">
                            {route["routeName"]}
                          </p>
                        </div>
                        <div className="location-card-section">
                          <button
                            className="x-btn"
                            onClick={() => removeRoute(ind)}
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  function searchRoutesList() {
    return (
      <div
        className="search-location-list"
        style={{ display: isAddingRoute ? "flex" : "none" }}
      >
        {searchRoutes.map((route, ind) => {
          return (
            <div
              key={ind}
              className="search-location"
              onClick={() => addRoute(ind)}
              style={{
                display: route["routeName"]
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
                  ? "flex"
                  : "none",
              }}
            >
              <div className="search-location-section">
                <p className="search-location-name">
                  {route["routeName"]}
                </p>
                <p className="search-location-address">
                  {route["locationDescription"]}
                </p>
              </div>
              <div className="search-location-section">
                <p>Data here</p>
              </div>
            </div>
          );
        })}
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

  function saveEdits() {
    let finalStartDay = new Date(); 
    let finalEndDay = new Date();

    if (routes.length === 0) {
      alert("Please add a route.");
      return;
    }
    const selectedRoute = routes[0]._id;
    const targetDay = day.toLowerCase();

    const today = new Date();
    const todayName = today.toLocaleString("en-us", { weekday: "long" }).toLowerCase();

    if (targetDay === todayName) {
      finalStartDay = today;
      finalEndDay = today;
    }

    for (let i = 1; i < 7; i++) {
      const temp = new Date(today);
      temp.setDate(today.getDate() + i);
      if (temp.toLocaleString("en-us", { weekday: "long" }).toLowerCase() === targetDay) {
        finalStartDay = temp;
        finalEndDay = temp;
        break;
      }
    }

    const [startHour, startMinute] = timeIntoHoursandMinutes(startTime);
    const [endHour, endMinute] = timeIntoHoursandMinutes(endTime);

    if (startHour === 0 && startMinute === 0 || 
      endHour === 0 && endMinute === 0 || 
      endHour < startHour || 
      (endHour === startHour && endMinute <= startMinute)) {
      alert("Please enter a valid start time.");
      return;
    }

    finalStartDay = new Date(finalStartDay);
    finalStartDay.setHours(startHour);
    finalStartDay.setMinutes(startMinute);
    finalStartDay.setSeconds(0);

    finalEndDay = new Date(finalEndDay);
    finalEndDay.setHours(endHour);
    finalEndDay.setMinutes(endMinute);
    finalEndDay.setSeconds(0);

    const newShift = {
      routeId: selectedRoute,
      shiftDate: finalStartDay,
      shiftEndDate: finalEndDay,
      recurrenceRule: "FREQ=WEEKLY;BYDAY=" + targetDay.toUpperCase().substring(0, 2),
    };
    

    createShift(JSON.stringify(newShift));

    alert("Shift created successfully.");


  }


    
    return (
        <div className="flex min-h-screen">
            <Sidebar/>
            <div className="flex flex-col w-full min-h-screen">
                <div className="flex flex-col p-9 space-y-6 border border-b-[#D3D8DE]">
                    <div onClick={() => router.push("/DailyShiftDashboard")} className="flex space-x-2 cursor-pointer">
                        <FontAwesomeIcon  icon={faArrowLeft} className="text-[#6C7D93] size-5 mt-[.1rem]"/>
                        <span className="font-semibold text-base text-[#6C7D93]">Back</span>
                    </div>
                    <div className="flex justify-between text-center align-middle">
                        <div className="text-[#072B68] font-bold text-4xl content-center">New Shift</div>
                        <div className="flex justify-between space-x-4">
                            <button onClick={() => router.push("/DailyShiftDashboard")} className="bg-[#ECF2F9] font-bold text-[#6C7D93] px-4 py-[.8rem] rounded-xl text-base border border-[#D3D8DE]">Cancel</button>
                            <button onClick={() => saveEdits()} className="bg-[#0F7AFF] font-bold text-white px-4 py-[.8rem] rounded-xl">Save edits</button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between pt-16 px-16 bg-[#ECF2F9] space-x-16 flex-grow">
                    <div className="h-[36rem] w-full flex space-x-16">
                        <div className="flex flex-col space-y-6 w-2/5">
                            <div className="flex flex-col space-y-2">
                                <label htmlFor="day" className="text-[#072B68] font-bold text-lg">Shift Day</label>
                                <select onChange={(e) => setDay(e.target.value)} id="day" name="day" className="px-4 py-[.8rem] rounded-xl border-r-[1.25rem] border-r-transparent outline outline-[#57A0D5]">
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <p className="text-[#072B68] font-bold text-lg">Shift Start Time</p>
                                  <input onChange={(e) => setStartTime(e.target.value)} ref={timeStartInputRef} onClick={() => handleClick()} className="px-4 py-[.8rem] rounded-xl border border-[#57A0D5] h-full" type="time" placeholder="Enter additional information here"/>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <p className="text-[#072B68] font-bold text-lg">Shift End Time</p>
                                  <input onChange={(e) => setEndTime(e.target.value)} ref={timeEndInputRef} onClick={() => handleClickEnd()} className="px-4 py-[.8rem] rounded-xl border border-[#57A0D5] h-full" type="time" placeholder="Enter additional information here"/>
                            </div>
                        </div>
                        <div className="flex flex-col justify-start w-3/5 space-y-2">
                            <p className="text-[#072B68] font-bold text-lg">Route</p>
                            <div className="flex flex-col justify-between px-4 py-[.8rem] rounded-xl border border-[#57A0D5] h-full bg-white">
                                    <div className="locations-box">
                                        <div
                                        className="location-input"
                                        style={{ display: isAddingRoute ? "flex" : "none" }}
                                        >
                                        <input
                                            className="field-input"
                                            type="text"
                                            placeholder="Start typing here"
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                        <button
                                            className="exit-add-location-btn x-btn"
                                            onClick={() => setIsAddingRoute(!isAddingRoute)}
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                        </div>
                                        {routesCards()}
                                        {searchRoutesList()}
                                        {routes.length > 0 ? <div></div>:<button
                                        className="add-location-btn"
                                        onClick={() => setIsAddingRoute(!isAddingRoute)}
                                        style={{ display: isAddingRoute ? "none" : "flex" }}
                                        >
                                        Add a Route
                                        </button>}
                                    </div>
                                
                                <div className="flex px-2 py-4 border-t-2 border-[#C6E3F9]">
                                    <h1 className="text-[#072B68] font-bold text-sm pr-2 border-r-2 border-[#57A0D5]">Route Locations</h1>
                                    <div className="flex pl-2 space-x-3">
                                        {routes.length > 0 ? <div className="flex flex-wrap">{locationsList()}</div> : (<div className="text-[#072B68] font-bold text-sm opacity-30">No locations have been selected yet.</div>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}