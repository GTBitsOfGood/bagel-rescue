"use client";

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';
import { faAngleDown, faAngleLeft, faAngleRight, faArrowUpShortWide, faEllipsis, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';

import { getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";

import AdminSidebar from '../../../components/AdminSidebar';


function LocationDashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [sortOption, setSortOption] = useState<string>('alphabetically');


  useEffect(() => {
    const fetchLocations = async () => {
      const response = await getAllLocations();
      const data = JSON.parse(response || "[]");

      setLocations(data || []);
    };
    fetchLocations();
  }, [sortOption]);


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
      <div className="container">
      <button className="back-btn"
      onClick={() => window.history.back()}>
        <FontAwesomeIcon icon={faAngleLeft} />
        <p>Back</p>
      </button>
      <div className="header">
        <p className="header-text">Locations</p>
      </div>
      <hr className="separator" />
        <div className={styles.container}>
          <div className={styles.searchAndSort}>
            <div className={styles.searchInputContainer}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search for route"
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
                    <button className={styles.moreOptionsButton}>⋮</button>
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
