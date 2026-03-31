"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faArrowUpShortWide,
  faEllipsis,
  faMagnifyingGlass,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./page.module.css";

import { deleteLocation, getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";

import AdminSidebar from "../../../components/AdminSidebar";
import { useRouter } from "next/navigation";
import { handleAuthError } from "@/lib/authErrorHandler";
import ThreeDotModal from "@/app/components/ThreeDotModal";
import { ObjectId } from "mongoose";
import { errorToast } from "@/lib/toastConfig";
import LoadingFallback from "@/app/components/LoadingFallback";

function LocationDashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState<string>("alphabetically");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [searchValue, setSearchValue] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocations();
  }, [router]);

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
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
        <div className={`${styles.header} shrink-0 bg-white`}>
          <p className={styles.headerText}>Locations</p>
          <button
            type="button"
            className="inline-flex min-w-max shrink-0 flex-nowrap items-center gap-2 whitespace-nowrap rounded-xl bg-[#0F7AFF] px-5 py-[0.8rem] font-bold text-white hover:bg-[#005bb5]"
            onClick={() => router.push("/AdminNavView/LocationCreationPage")}
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4 shrink-0" />
            <span>New Location</span>
          </button>
        </div>

        <hr className={`${styles.separator} shrink-0`} />
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <div className={styles.searchAndSort}>
              <div className={styles.searchInputContainer}>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className={`${styles.searchIcon} h-4 w-4 shrink-0`}
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
                  type="button"
                  className={styles.filterButton}
                  onClick={handleSortChange}
                >
                  Sort
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className={`${styles.locationDashLoading} flex-1`}>
                <LoadingFallback />
              </div>
            ) : (
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
                            type="button"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationDashboardPage;
