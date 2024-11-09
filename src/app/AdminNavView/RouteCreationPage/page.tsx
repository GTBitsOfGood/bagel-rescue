"use client";

import "./stylesheet.css";
import mongoose from "mongoose";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faAngleLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";
import { ILocation } from "@/server/db/models/Route";
import { createRoute } from "@/server/db/actions/Route";
import AdminSidebar from '../../../components/AdminSidebar';

function RouteCreationPage() {
  const [routeName, setRouteName] = useState<string>("");
  const [routeArea, setRouteArea] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [isAddingLocation, setIsAddingLocation] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchLocations, setSearchLocations] = useState<Location[]>([]);
  const [locationsIsPickUp, setLocationsIsPickUp] = useState<
    Map<string, boolean>
  >(new Map());

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await getAllLocations();
      const data = JSON.parse(response || "[]");
      setSearchLocations(data || []);
    };
    fetchLocations();
  }, []);

  function changeIsPickUp(locationName: string): void {
    const newIsPickUp = new Map(locationsIsPickUp);
    newIsPickUp.set(locationName, !newIsPickUp.get(locationName));
    setLocationsIsPickUp(newIsPickUp);
  }

  function addLocation(index: number): void {
    const newLocations = [...locations];
    newLocations.push(searchLocations[index]);
    setLocations(newLocations);

    const newIsPickUp = new Map(locationsIsPickUp);
    newIsPickUp.set(searchLocations[index]["locationName"], true);
    setLocationsIsPickUp(newIsPickUp);

    const newSearchLocations = [...searchLocations];
    newSearchLocations.splice(index, 1);
    setSearchLocations(newSearchLocations);

    setIsAddingLocation(!isAddingLocation);
  }

  function removeLocation(index: number): void {
    const newSearchLocations = [...searchLocations];
    newSearchLocations.push(locations[index]);
    setSearchLocations(newSearchLocations);

    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  }

  function completeRoute(): void {
    const locs: ILocation[] = locations.map((item) => ({
      location: new mongoose.Types.ObjectId(item["_id"]!),
      type: locationsIsPickUp.get(item["locationName"]) ? "pickup" : "dropoff",
    }));
    const route = {
      routeName: routeName,
      locationDescription: routeArea,
      locations: locs,
    };
    createRoute(JSON.stringify(route));
  }

  function locationCards() {
    function handleOnDragEnd(result: any) {
      if (!result.destination) return;

      const items = Array.from(locations);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);

      setLocations(items);
    }

    return (

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="location-cards-list">
          {(provided) => (
            <div
              className="location-cards-list"
              style={{
                display: isAddingLocation
                  ? "none"
                  : locations.length > 0
                  ? "flex"
                  : "none",
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {locations.map((location, ind) => {
                return (
                  <Draggable
                    key={location["locationName"]}
                    draggableId={location["locationName"]}
                    index={ind}
                  >
                    {(provided) => (
                      <div
                        key={ind}
                        className={location["locationName"] + " location-card"}
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
                            {location["locationName"]}
                          </p>
                        </div>
                        <div className="location-card-section">
                          <button
                            className="location-pick-drop"
                            onClick={() =>
                              changeIsPickUp(location["locationName"])
                            }
                            style={{
                              backgroundColor: locationsIsPickUp.get(
                                location["locationName"]
                              )
                                ? "#a4f4b6"
                                : "#f4c6a4",
                            }}
                          >
                            {locationsIsPickUp.get(location["locationName"])
                              ? "Pick Up"
                              : "Drop Off"}
                          </button>
                          <button
                            className="x-btn"
                            onClick={() => removeLocation(ind)}
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

  function searchLocationsList() {
    return (
      <div
        className="search-location-list"
        style={{ display: isAddingLocation ? "flex" : "none" }}
      >
        {searchLocations.map((location, ind) => {
          return (
            <div
              key={ind}
              className="search-location"
              onClick={() => addLocation(ind)}
              style={{
                display: location["locationName"]
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
                  ? "flex"
                  : "none",
              }}
            >
              <div className="search-location-section">
                <p className="search-location-name">
                  {location["locationName"]}
                </p>
                <p className="search-location-address">
                  {location["address"]["street"] +
                    ", " +
                    location["address"]["city"] +
                    ", " +
                    location["address"]["state"] +
                    " " +
                    location["address"]["zipCode"]}
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

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
    <div className="container">
      <button className="back-btn"
      onClick={() => window.history.back()}>
        <FontAwesomeIcon icon={faAngleLeft} />
        <p>Back</p>
      </button>
      <div className="header">
        <p className="header-text">Create a Route</p>
        <button
          className="complete-route-btn"
          onClick={completeRoute}
          style={{
            backgroundColor:
              routeName != "" && routeArea != "" && locations.length > 0
                ? "#3d97ff"
                : "#a3a3a3",
            cursor:
              routeName != "" && routeArea != "" && locations.length > 0
                ? "pointer"
                : "default",
          }}
        >
          Complete Route
        </button>
      </div>
      <hr className="separator" />
      <div className="route-creation-form">
        <div className="route-info">
          <div className="field-container">
            <p className="field-title">Route Name</p>
            <input
              className="field-input"
              type="text"
              placeholder="Add a Route Name Here"
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>
          <div className="field-container">
            <p className="field-title">Route Area</p>
            <input
              className="field-input"
              type="text"
              placeholder="ie. Atlanta, Norcross, Marietta"
              onChange={(e) => setRouteArea(e.target.value)}
            />
          </div>
          <div className="field-container">
            <p className="field-title">Additional Information</p>
            <textarea
              className="field-input"
              placeholder="Enter additional information here"
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>
        </div>
        <div className="locations field-container">
          <p className="field-title">Locations</p>
          <div className="locations-box">
            <div
              className="location-input"
              style={{ display: isAddingLocation ? "flex" : "none" }}
            >
              <input
                className="field-input"
                type="text"
                placeholder="Start typing here"
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button
                className="exit-add-location-btn x-btn"
                onClick={() => setIsAddingLocation(!isAddingLocation)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {locationCards()}
            {searchLocationsList()}
            <button
              className="add-location-btn"
              onClick={() => setIsAddingLocation(!isAddingLocation)}
              style={{ display: isAddingLocation ? "none" : "flex" }}
            >
              Add a Location
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default RouteCreationPage;
