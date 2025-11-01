"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';
import { faAngleDown, faAngleLeft, faAngleRight, faArrowUpShortWide, faEllipsis, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

import { deleteLocation, getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";

import AdminSidebar from '../../../components/AdminSidebar';
import { useRouter } from "next/navigation";
import { handleAuthError } from "@/lib/authErrorHandler";
import ThreeDotModal from '@/app/components/ThreeDotModal';
import { ObjectId } from 'mongoose';


function LocationDashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [sortOption, setSortOption] = useState<string>('alphabetically');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await getAllLocations();
        const data = JSON.parse(response || "[]");
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
  }, [sortOption]);

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const deleted = await deleteLocation(locationId);
      if (deleted) {
        setLocations((prevLocations) =>
          prevLocations.filter((location) => location._id !== locationId)
        );
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  }
    


  const handleSortChange = () => {
    const sortedLocations = [...locations];
    if (sortOption === 'alphabetically') {
      sortedLocations.sort((a: Location, b: Location) => a.locationName.localeCompare(b.locationName));
    } else if (sortOption === 'byType') {
      sortedLocations.sort((a: Location, b: Location) => {
        if (a.type === b.type) {
          return 0;
        }
        return a.type === 'Drop-Off' ? -1 : 1;
      });
    }
    setLocations(sortedLocations);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);

  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <div className={styles.header}>
          <p className={styles.headerText}>Locations</p>
          <div className="flex flex-row justify-between text-center align-middle">
            <button
              className={styles.newLocationButton}
              onClick={() => router.push("/AdminNavView/LocationCreationPage")}>
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
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for location"
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterControls}>
              <h1>Sorted:</h1>
              <select className={styles.sortSelect} value={sortOption} onChange={handleFilterChange}>
                <option value="alphabetically">Alphabetically</option>
                <option value="byType">By Type</option>
              </select>
              <button className={styles.filterButton} onClick={handleSortChange}>Filter</button>
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
              {locations.map((location, index) => (
                <div key={index} className={styles.locationCard}>
                  <div className={styles.locationDetails}>
                    <div className={styles.locationInfo}>
                      <strong>{location.locationName}</strong>
                      <div>{location.contact}</div>
                    </div>
                    <div className={styles.locationInfo}>{location.address.street + ", " + location.address.city + ", " + location.address.state + " " + location.address.zipCode}</div>
                    <div className={`${styles.locationInfo} ${location.type === 'Pick-Up' ? styles.pickUp : styles.dropOff}`}>
                      {location.type}
                    </div>
                    <div className={styles.locationInfo}>{location.bags}</div>
                    <div className={styles.locationInfo}>{location.notes}</div>
                    <div className={styles.actionColumn}>
                      <button 
                        className={styles.threeDotButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setModalPosition({
                            x: rect.right,
                            y: rect.top
                          });
                          setActiveLocationId(location._id?.toString() || null);
                          setIsModalOpen(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsis} />
                      </button>
                    </div>
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
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDashboardPage;
