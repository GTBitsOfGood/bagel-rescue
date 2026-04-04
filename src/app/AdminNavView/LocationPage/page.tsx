"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";
import {
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faArrowUpShortWide,
  faEllipsis,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { deleteLocation, getAllLocations, updateLocation } from "@/server/db/actions/location";
import { Location, Address } from "@/server/db/models/location";
import locationOptions from "@/lib/locations";

import AdminSidebar from "../../../components/AdminSidebar";
import { useRouter } from "next/navigation";
import { handleAuthError } from "@/lib/authErrorHandler";
import ThreeDotModal from "@/app/components/ThreeDotModal";
import { ObjectId } from "mongoose";
import { errorToast, successToast } from "@/lib/toastConfig";

function LocationDashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [sortOption, setSortOption] = useState<string>("alphabetically");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [searchValue, setSearchValue] = useState("");

  // Edit modal state
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editLocName, setEditLocName] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editZipCode, setEditZipCode] = useState<number>(0);
  const [editArea, setEditArea] = useState("");
  const [editType, setEditType] = useState<"Pick-Up" | "Drop-Off">("Drop-Off");
  const [editBags, setEditBags] = useState<number>(0);
  const [editContact, setEditContact] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getAllLocations();
        const data = JSON.parse(response || "[]");
        data.sort((a: Location, b: Location) =>
          a.locationName.localeCompare(b.locationName)
        );
        setLocations(data || []);
      } catch (error) {
        if (handleAuthError(error, router)) {
          return; // Auth error handled, user redirected
        }
        console.error("Error fetching locations:", error);
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  const handleDeleteLocation = async (locationId: string) => {
    const deleted = await deleteLocation(locationId);
    if (deleted.success) {
      setLocations((prevLocations) =>
        prevLocations.filter((location) => location._id !== locationId)
      );
    } else {
      errorToast(deleted.message || "Error deleting location");
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setEditLocName(location.locationName);
    setEditStreet(location.address.street);
    setEditCity(location.address.city);
    setEditState(location.address.state);
    setEditZipCode(location.address.zipCode);
    setEditArea(location.area);
    setEditType(location.type);
    setEditBags(typeof location.bags === "number" ? location.bags : 0);
    setEditContact(location.contact || "");
    setEditNotes(location.notes || "");
    setIsModalOpen(false);
    setActiveLocationId(null);
  };

  const formatContact = (contact: string) => {
    let formatted = contact.replace(/[^\d]/g, "");
    if (formatted.length > 10) formatted = formatted.slice(0, 10);
    formatted = formatted.replace(/^(\d{3})(\d{1})/, "$1-$2");
    formatted = formatted.replace(/^(\d{3})-(\d{3})(\d{1})/, "$1-$2-$3");
    return formatted;
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;

    if (
      !editLocName.trim() ||
      !editStreet.trim() ||
      !editCity.trim() ||
      !editState.trim() ||
      editZipCode <= 0 ||
      !editArea || editArea === "None" ||
      editBags <= 0
    ) {
      errorToast("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedData: Location = {
        locationName: editLocName.trim(),
        address: {
          street: editStreet.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          zipCode: editZipCode,
        },
        type: editType,
        area: editArea,
        bags: editBags,
        contact: editContact,
        notes: editNotes.trim(),
      };

      const result = await updateLocation(
        editingLocation._id!.toString(),
        JSON.stringify(updatedData)
      );

      if (result.success && result.data) {
        const updated = JSON.parse(result.data);
        setLocations((prev) =>
          prev.map((loc) =>
            loc._id?.toString() === editingLocation._id?.toString() ? updated : loc
          )
        );
        successToast("Location updated successfully!");
        setEditingLocation(null);
      } else {
        errorToast(result.message || "Failed to update location.");
      }
    } catch {
      errorToast("An unexpected error occurred while updating.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSortChange = () => {
    const sortedLocations = [...locations];
    if (sortOption === "alphabetically") {
      sortedLocations.sort((a: Location, b: Location) =>
        a.locationName.localeCompare(b.locationName)
      );
    } else if (sortOption === "byType") {
      sortedLocations.sort((a: Location, b: Location) => {
        if (a.type === b.type) {
          return 0;
        }
        return a.type === "Drop-Off" ? -1 : 1;
      });
    }
    setLocations(sortedLocations);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const handleThreeDotClick = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.right,
      y: rect.top,
    });
    setActiveLocationId(locationId);
    setIsModalOpen(true);
  };

  const searchLocations = [...locations]
    .filter((location) =>
      location.locationName.toUpperCase().includes(searchValue.toUpperCase())
    )
    .sort((a: Location, b: Location) =>
      a.locationName.localeCompare(b.locationName)
    );

  const shownLocations = searchValue.length === 0 ? locations : searchLocations;

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <div className={styles.header}>
          <p className={styles.headerText}>Locations</p>
          <div className="flex flex-row justify-between text-center align-middle">
            <button
              className={styles.newLocationButton}
              onClick={() => router.push("/AdminNavView/LocationCreationPage")}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Location
            </button>
          </div>
        </div>

        <hr className={styles.separator} />
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.searchAndSort}>
              <div className={styles.searchInputContainer}>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  placeholder="Search for location"
                  className={styles.searchInput}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <div className={styles.filterControls}>
                <h1>Sorted:</h1>
                <select
                  className={styles.sortSelect}
                  value={sortOption}
                  onChange={handleFilterChange}
                >
                  <option value="alphabetically">Alphabetically</option>
                  <option value="byType">By Type</option>
                </select>
                <button
                  className={styles.filterButton}
                  onClick={handleSortChange}
                >
                  Sort
                </button>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div className={styles.columnHeader}>Location and Contact</div>
                <div className={styles.columnHeader}>Address</div>
                <div className={styles.columnHeader}>Type</div>
                <div className={styles.columnHeader}>Bags</div>
                <div className={styles.columnHeader}>Additional notes</div>
                <div className={styles.columnHeader}></div>
              </div>
              <div className={styles.locationList}>
                {shownLocations.map((location, index) => (
                  <div key={index} className={styles.locationCard}>
                    <div className={styles.locationDetails}>
                      <div className={styles.locationInfo}>
                        <strong>{location.locationName}</strong>
                        <div>{location.contact}</div>
                      </div>
                      <div className={styles.locationInfo}>
                        {location.address.street +
                          ", " +
                          location.address.city +
                          ", " +
                          location.address.state +
                          " " +
                          location.address.zipCode}
                      </div>
                      <div
                        className={`${styles.locationInfo} ${
                          location.type === "Pick-Up"
                            ? styles.pickUp
                            : styles.dropOff
                        }`}
                      >
                        {location.type}
                      </div>
                      <div className={styles.locationInfo}>{location.bags}</div>
                      <div className={styles.locationInfo}>
                        {location.notes}
                      </div>
                      <div className={styles.locationEllipsis}>
                        <button
                          className={styles.threeDotButton}
                          onClick={(e) =>
                            handleThreeDotClick(
                              e,
                              location._id?.toString() || ""
                            )
                          }
                        >
                          <FontAwesomeIcon icon={faEllipsis} />
                        </button>
                        {activeLocationId === location._id?.toString() && (
                          <ThreeDotModal
                            isOpen={isModalOpen}
                            onClose={() => {
                              setIsModalOpen(false);
                              setActiveLocationId(null);
                            }}
                            onEdit={() => handleEditLocation(location)}
                            onDelete={() => {
                              handleDeleteLocation(location._id?.toString()!);
                              setIsModalOpen(false);
                              setActiveLocationId(null);
                            }}
                            position={modalPosition}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {editingLocation && (
        <div className={styles.editOverlay} onClick={() => setEditingLocation(null)}>
          <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.editModalTitle}>Edit Location</h2>
            <div className={styles.editFormGrid}>
              <div className={styles.editFormColumn}>
                <label className={styles.editLabel}>
                  Location Name<span className={styles.required}>*</span>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editLocName}
                    onChange={(e) => setEditLocName(e.target.value)}
                  />
                </label>
                <label className={styles.editLabel}>
                  Street Address<span className={styles.required}>*</span>
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editStreet}
                    onChange={(e) => setEditStreet(e.target.value)}
                  />
                </label>
                <label className={styles.editLabel}>
                  Area<span className={styles.required}>*</span>
                  <select
                    className={styles.editInput}
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                  >
                    <option value="None">---</option>
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </label>
                <div className={styles.editInlineFields}>
                  <label className={styles.editLabel}>
                    City<span className={styles.required}>*</span>
                    <input
                      type="text"
                      className={styles.editInput}
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                    />
                  </label>
                  <label className={styles.editLabel}>
                    State<span className={styles.required}>*</span>
                    <input
                      type="text"
                      className={styles.editInput}
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                    />
                  </label>
                </div>
                <label className={styles.editLabel}>
                  Zip Code<span className={styles.required}>*</span>
                  <input
                    type="number"
                    className={styles.editInput}
                    value={editZipCode || ""}
                    onChange={(e) => setEditZipCode(Number(e.target.value))}
                  />
                </label>
              </div>
              <div className={styles.editFormColumn}>
                <label className={styles.editLabel}>
                  Drop Off or Pick Up?<span className={styles.required}>*</span>
                  <select
                    className={styles.editInput}
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as "Pick-Up" | "Drop-Off")}
                  >
                    <option value="Drop-Off">Drop Off</option>
                    <option value="Pick-Up">Pick Up</option>
                  </select>
                </label>
                <label className={styles.editLabel}>
                  Delivery Amount<span className={styles.required}>*</span>
                  <input
                    type="number"
                    className={styles.editInput}
                    min="0"
                    value={editBags || ""}
                    onChange={(e) => setEditBags(Number(e.target.value))}
                  />
                </label>
                <label className={styles.editLabel}>
                  Contact
                  <input
                    type="text"
                    className={styles.editInput}
                    value={editContact}
                    onChange={(e) => setEditContact(formatContact(e.target.value))}
                  />
                </label>
                <label className={styles.editLabel}>
                  Additional Information
                  <textarea
                    className={styles.editTextarea}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                  />
                </label>
              </div>
            </div>
            <div className={styles.editActions}>
              <button
                className={styles.editCancelButton}
                onClick={() => setEditingLocation(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className={styles.editSaveButton}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationDashboardPage;
