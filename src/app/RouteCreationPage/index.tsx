"use client";

import "./stylesheet.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGripVertical,
  faAngleLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

function RouteCreationPage() {
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [inputsFilled, setInputsFilled] = useState([false, false]);
  const [locations, setLocations] = useState([
    {
      locationName: "mattjzhou's HOUSE.",
      notes: "",
      address: {
        street: "Catalyst",
        city: "A City",
        zipCode: 12345,
        state: "VA",
      },
    },
    {
      locationName: "Loc2",
      notes: "",
      address: { street: "A St", city: "A City", zipCode: 12345, state: "VA" },
    },
  ]);
  const [searchLocations, setSearchLocations] = useState([
    {
      locationName: "mattjzhou's HOUSE. searching.",
      notes: "",
      address: {
        street: "Catalyst",
        city: "A City",
        zipCode: 12345,
        state: "VA",
      },
    },
    {
      locationName: "mattjzhou's HOUSE. searching.",
      notes: "",
      address: {
        street: "Catalyst",
        city: "A City",
        zipCode: 12345,
        state: "VA",
      },
    },
    {
      locationName: "mattjzhou's HOUSE. searching.",
      notes: "",
      address: {
        street: "Catalyst",
        city: "A City",
        zipCode: 12345,
        state: "VA",
      },
    },
    {
      locationName: "mattjzhou's HOUSE. searching.",
      notes: "",
      address: {
        street: "Catalyst",
        city: "A City",
        zipCode: 12345,
        state: "VA",
      },
    },
    {
      locationName: "LocSearch",
      notes: "",
      address: { street: "A St", city: "A City", zipCode: 12345, state: "VA" },
    },
  ]);
  const [locationsIsPickUp, setLocationsIsPickUp] = useState([true, true]);

  function changeIsAddingLocation() {
    setIsAddingLocation(!isAddingLocation);
  }

  function changeIsPickUp(index: number) {
    const newIsPickUp = [...locationsIsPickUp];
    newIsPickUp[index] = !newIsPickUp[index];
    setLocationsIsPickUp(newIsPickUp);
  }

  function addLocation(index: number) {
    const newLocations = [...locations];
    newLocations.push(searchLocations[index]);
    setLocations(newLocations);
    const newLocationsIsPickup = [...locationsIsPickUp];
    newLocationsIsPickup.push(true);
    setLocationsIsPickUp(newLocationsIsPickup);
    const newSearchLocations = [...searchLocations];
    newSearchLocations.splice(index, 1);
    setSearchLocations(newSearchLocations);
    setIsAddingLocation(!isAddingLocation);
  }

  function removeLocation(index: number) {
    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
  }

  function handleInputChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const newInputsFilled = [...inputsFilled];
    newInputsFilled[index] = e.target.value != "";
    setInputsFilled(newInputsFilled);
  }

  function locationCards() {
    return (
      <div
        className="location-cards-list"
        style={{ display: isAddingLocation ? "none" : "flex" }}
      >
        {locations.map((location, ind) => {
          return (
            <div className="location-card">
              <div className="location-card-section">
                <FontAwesomeIcon icon={faGripVertical} />
                <p className="location-number">{ind + 1}</p>
                <p className="location-name">{location["locationName"]}</p>
              </div>
              <div className="location-card-section">
                <button
                  className="location-pick-drop"
                  onClick={() => changeIsPickUp(ind)}
                  style={{
                    backgroundColor: locationsIsPickUp[ind]
                      ? "#a4f4b6"
                      : "#f4c6a4",
                  }}
                >
                  {locationsIsPickUp[ind] ? "Pick Up" : "Drop Off"}
                </button>
                <button
                  className="exit-btn"
                  onClick={() => removeLocation(ind)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
            <div className="search-location" onClick={() => addLocation(ind)}>
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
                <p>{500}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="container">
      <div>
        <button className="back-btn">
          <FontAwesomeIcon icon={faAngleLeft} />
          <p>Back</p>
        </button>
      </div>
      <div className="header">
        <p className="header-text">Create a Route</p>
        <button
          className="complete-route-btn"
          style={{
            backgroundColor:
              !inputsFilled.includes(false) && locations.length > 0
                ? "#3d97ff"
                : "#a3a3a3",
            cursor:
              !inputsFilled.includes(false) && locations.length > 0
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
          <div className="route-name field-container">
            <p className="field-title">Route Name</p>
            <input
              className="field-input"
              type="text"
              placeholder="Add a Route Name Here"
              onChange={(e) => handleInputChange(0, e)}
            />
          </div>
          <div className="route-area field-container">
            <p className="field-title">Route Area</p>
            <input
              className="field-input"
              type="text"
              placeholder="ie. Atlanta, Norcross, Marietta"
              onChange={(e) => handleInputChange(1, e)}
            />
          </div>
          <div className="additional-info field-container">
            <p className="field-title">Additional Information</p>
            <input
              className="field-input additional-info-field-input"
              type="text"
              placeholder="Enter additional information here"
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
              />
              <button
                className="exit-add-location-btn exit-btn"
                onClick={changeIsAddingLocation}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {locationCards()}
            {searchLocationsList()}
            <button
              className="add-location-btn"
              onClick={changeIsAddingLocation}
              style={{ display: isAddingLocation ? "none" : "flex" }}
            >
              Add a Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteCreationPage;
