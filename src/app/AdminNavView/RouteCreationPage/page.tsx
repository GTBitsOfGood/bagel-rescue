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
import { useRouter } from "next/navigation";

import { getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";
import { ILocation } from "@/server/db/models/Route";
import { getRoute, createRoute } from "@/server/db/actions/Route";
import AdminSidebar from "../../../components/AdminSidebar";

function RouteCreationPage() {
  const [routeName, setRouteName] = useState<string>("");
  // const [routeArea, setRouteArea] = useState<string>("");
  const [routeArea, setRouteArea] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [isAddingLocation, setIsAddingLocation] = useState<boolean>(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchLocations, setSearchLocations] = useState<Location[]>([]);
  const [locationsLoaded, setLocationsLoaded] = useState(false);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  // location._id (string) -> boolean (true = pickup, false = dropoff)
  const [locationsIsPickUp, setLocationsIsPickUp] = useState<
    Map<string, boolean>
  >(new Map());
   const [prefilled, setPrefilled] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDuplicateId(params.get("duplicate"));
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await getAllLocations();
      const data = JSON.parse(response || "[]");
      setSearchLocations(data || []);
      setLocationsLoaded(true);
    };
    fetchLocations();
  }, []);


useEffect(() => {
  if (!duplicateId || !locationsLoaded || prefilled) return;
  const fetchRouteToDuplicate = async () => {
    try {
      const route = await getRoute(duplicateId);
      if (!route) return;

      // prefill fields
      setRouteName((route.routeName ?? "") + " Copy");
      setRouteArea(route.locationDescription.split(", ") ?? []);
      setAdditionalInfo(route.additionalInfo ?? "");

      const idToLocation = new Map<string, Location>();
      searchLocations.forEach((loc: any) =>
        idToLocation.set(String(loc._id), loc)
      );

      const orderedLocations: Location[] = route.locations.map((rloc: any) => {
        const id = String(rloc.location);
        const found = idToLocation.get(id);
        const locationObj: Location = found
          ? { ...found }
          : {
              _id: id,
              locationName: `Unknown (${id.slice(0, 6)})`,
              notes: "",
              contact: "",
              address: { street: "", city: "", state: "", zipCode: 0 },
              area: "",
              type: "Pick-Up",
              bags: 0,
            };
        locationObj.bags = rloc.bags ?? 0;
        return locationObj;
      });

      setLocations(orderedLocations);

      const isPickUpMap = new Map<string, boolean>();
      orderedLocations.forEach((loc, i) => {
        const id = String(loc._id);
        const type = route.locations[i]?.type === "pickup";
        isPickUpMap.set(id, type);
      });
      setLocationsIsPickUp(isPickUpMap);

      const usedIds = new Set(orderedLocations.map((l) => String(l._id)));
      setSearchLocations((prev) =>
        prev.filter((l) => !usedIds.has(String(l._id)))
      );

      setPrefilled(true);
    } catch (err) {
      console.error("Failed to fetch duplicate route", err);
    }
  };

  fetchRouteToDuplicate();
}, [duplicateId, locationsLoaded, prefilled, searchLocations]);


  function changeIsPickUp(locationId: string): void {
    const newIsPickUp = new Map(locationsIsPickUp);
    newIsPickUp.set(locationId, !newIsPickUp.get(locationId));
    setLocationsIsPickUp(newIsPickUp);
  }

  function addLocation(index: number): void {
    const locToAdd = searchLocations[index];
    if (!locToAdd) return;

    const newLocations = [...locations, locToAdd];
    setLocations(newLocations);

    setRouteArea([...routeArea, locToAdd.area].toSorted());

    const newIsPickUp = new Map(locationsIsPickUp);
    newIsPickUp.set(
      String(locToAdd._id),
      locToAdd.type ? locToAdd.type === "Pick-Up" : true
    );
    setLocationsIsPickUp(newIsPickUp);

    const newSearchLocations = [...searchLocations];
    newSearchLocations.splice(index, 1);
    setSearchLocations(newSearchLocations);

    setIsAddingLocation(false);
  }

  function removeLocation(index: number): void {
    const newLocations = [...locations];
    const [removed] = newLocations.splice(index, 1);
    setLocations(newLocations);

    const newIsPickUp = new Map(locationsIsPickUp);
    newIsPickUp.delete(String(removed._id));
    setLocationsIsPickUp(newIsPickUp);
    setSearchLocations((prev) => [...prev, removed]);
  }

  function completeRoute(): void {
    const locs: ILocation[] = locations.map((item) => ({
      location: new mongoose.Types.ObjectId(item["_id"]!),
      type: locationsIsPickUp.get(String(item["_id"])) ? "pickup" : "dropoff",
    }));
    const route = {
      routeName: routeName,
      locationDescription: routeArea.join(", "),
      additionalInfo: additionalInfo,
      locations: locs,
    };
    createRoute(JSON.stringify(route))
      .then(() => {
        alert("Route created successfully!");
        router.push("/AdminNavView/DailyShiftDashboard");
      })
      .catch(() => alert("Failed to create route."));
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
                const idStr = String(location._id);
                const isPickUp = locationsIsPickUp.get(idStr) ?? true;
                return (
                  <Draggable
                    key={idStr}
                    draggableId={idStr}
                    index={ind}
                  >
                    {(provided) => (
                      <div
                        key={idStr}
                        className={idStr + " location-card"}
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
                            onClick={() => changeIsPickUp(idStr)}
                            style={{
                              backgroundColor: isPickUp
                                ? "#a4f4b6"
                                : "#f4c6a4",
                            }}
                          >
                            {isPickUp ? "Pick Up" : "Drop Off"}
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
              key={String(location._id)}
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
                <button
                  className="location-pick-drop"
                  style={{
                    backgroundColor:
                      location["type"] === "Pick-Up" ? "#a4f4b6" : "#f4c6a4",
                  }}
                >
                  {location["type"] ?? "Pick-Up"}
                </button>
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
          <button className="back-btn" onClick={() => window.history.back()}>
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
                  routeName != "" && locations.length > 0
                    ? "#3d97ff"
                    : "#a3a3a3",
                cursor:
                  routeName != "" && locations.length > 0
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
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
              </div>
              <div className="field-container">
                <p className="field-title">Route Area</p>
                <input
                  className="field-input"
                  type="text"
                  value={routeArea.join(", ")}
                  disabled
                />
              </div>
              <div className="field-container">
                <p className="field-title">Additional Information</p>
                <textarea
                  className="field-input"
                  placeholder="Enter additional information here"
                  value={additionalInfo}
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
