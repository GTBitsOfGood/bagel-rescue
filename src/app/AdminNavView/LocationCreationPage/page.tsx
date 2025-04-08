"use client";

import "./stylesheet.css";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from '../../../components/AdminSidebar';
import { Location } from "@/server/db/models/location";
import { Address } from "@/server/db/models/location";
import { createLocation } from "@/server/db/actions/location";
import { useRouter } from "next/navigation";

function LocationCreationPage() {
    const [locName, setLocName] = useState<string>("");
    const [streetName, setStreetName] = useState<string>("");
    const [cityName, setCityName] = useState<string>("");
    const [stateName, setStateName] = useState<string>("");
    const [theZipCode, setTheZipCode] = useState<number>(0);
    const [deliveryType, setDeliveryType] = useState<"Drop-Off" | "Pick-Up" | "None">("None");
    const [deliveryAmount, setDeliveryAmount] = useState<number>(0);
    const [additionalInfo, setAdditionalInfo] = useState<string>("");

    const router = useRouter();

    function saveLocation(): void {
        if (
            locName == "" ||
            streetName == "" ||
            cityName == "" ||
            stateName == "" ||
            theZipCode <= 0 ||
            deliveryType == "None" ||
            deliveryAmount <= 0
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        const theAddress: Address = {
            street: streetName,
            city: cityName,
            state: stateName,
            zipCode: theZipCode
        };

        const location: Location = {
            locationName: locName,
            address: {...theAddress},
            notes: additionalInfo,
            contact: "",
            type: deliveryType,
            bags: deliveryAmount
        };

        console.log(stateName.length);
        createLocation(JSON.stringify(location))
        .then(() => {
        alert("Location created successfully!");
        router.push("/AdminNavView/LocationPage");
        })
        .catch(() => alert("Failed to create location."));
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
                <p className="header-text">Create a New Location</p>
                <button
                className="complete-location-btn"
                style={{
                    backgroundColor:
                    locName != "" && streetName != "" && cityName != "" && stateName != "" && theZipCode > 0 && deliveryAmount > 0
                        ? "#3d97ff"
                        : "#a3a3a3",
                    cursor:
                    locName != "" && streetName != "" && cityName != "" && stateName != "" && theZipCode > 0 && deliveryAmount > 0
                        ? "pointer"
                        : "default",
                }}
                onClick={saveLocation}>
                Save
                </button>
            </div>
            <hr className="separator" />
            <div className="location-creation-form">
                <div className="location-info">
                <div className="field-container">
                    <p className="field-title">Location Name</p>
                    <input
                    className="field-input"
                    type="text"
                    placeholder="Add a Location Name Here"
                    onChange={(e) => setLocName(e.target.value)}
                    />
                </div>
                <div className="field-container">
                    <p className="field-title">Street Address</p>
                    <input
                    className="field-input"
                    type="text"
                    placeholder="Add a Street Name Here"
                    onChange={(e) => setStreetName(e.target.value)}
                    />
                </div>
                <div className="field-container">
                    <p className="field-title">City</p>
                    <input
                    className="field-input"
                    type="text"
                    placeholder="Add a City Name Here"
                    onChange={(e) => setCityName(e.target.value)}
                    />
                </div>
                <div className="field-container">
                    <p className="field-title">State</p>
                    <input
                    className="field-input"
                    type="text"
                    placeholder="Add a State Here (ie. GA, NY)"
                    onChange={(e) => setStateName(e.target.value)}
                    />
                </div>
                <div className="field-container">
                    <p className="field-title">Zip Code</p>
                    <input
                    className="field-input"
                    type="text"
                    placeholder="Add a Zip Code Here"
                    onChange={(e) => setTheZipCode(Number(e.target.value))}
                    />
                </div>
                </div>
                <div className="location-info">
                    <div className="field-container">
                        <p className="field-title">Drop Off or Pick Up?</p>
                        <select className="field-input" name="Select Type"
                        onChange={(e) => setDeliveryType(e.target.value as "Drop-Off" | "Pick-Up" | "None")}>
                            <option value="None">Select Type</option>
                            <option value="Drop-Off">Drop Off</option>
                            <option value="Pick-Up">Pick Up</option>
                        </select>
                    </div>
                    <div className="field-container">
                        <p className="field-title">Delivery Amount</p>
                        <input
                        className="field-input"
                        type="number"
                        min="0"
                        placeholder="Add a Delivery Amount Here"
                        onChange={(e) => setDeliveryAmount(Number(e.target.value))}
                        />
                    </div>
                    <div className="field-container">
                        <p className="field-title">Contact</p>
                        <input
                        className="field-input"
                        type="text"
                        placeholder="Add a Contact Number Here (optional)"
                        onChange={(e) => setTheZipCode(Number(e.target.value))}
                        />
                    </div>
                    <div className="field-container">
                        <p className="field-title">Additional Information</p>
                        <div>
                            <textarea
                            className="field-input additional-info"
                            placeholder="Enter additional information here (optional)"
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default LocationCreationPage;