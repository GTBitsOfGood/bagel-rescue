"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import mongoose from 'mongoose';


import { getAllLocations } from "@/server/db/actions/location";
import { Location } from "@/server/db/models/location";


// const locations = [
//   {
//     name: 'Location Name',
//     contact: '123-456-7890',
//     address: '1234 Address Name, Apt. 56, Atlanta, GA',
//     type: 'Drop-Off',
//     bags: 1234,
//     notes: 'Additional Notes are placed here, and will include info about that in case it’s necessary, so this is where that...',
//   },
//   {
//     name: 'Location Name',
//     contact: '123-456-7890',
//     address: '1234 Address Name, Apt. 56, Atlanta, GA',
//     type: 'Pick-Up',
//     bags: 1234,
//     notes: 'Additional Notes are placed here, and will include info about that in case it’s necessary, so this is where that...',
//   },
// ];

function LocationDashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [sortOption, setSortOption] = useState<string>('alphabetically');

  useEffect(() => {
    const fetchLocations = async () => {
      const response = await getAllLocations();
      const data = JSON.parse(response || "[]");

      if (sortOption === 'alphabetically') {
        data.sort((a: Location, b: Location) => a.locationName.localeCompare(b.locationName));
      } else if (sortOption === 'byType') {
        data.sort((a: Location, b: Location) => {
          if (a.type === b.type) {
            return 0;
          }
          return a.type === 'Drop-Off' ? -1 : 1;
        });
      }

      setLocations(data || []);
    };
    fetchLocations();
  }, [sortOption]);


  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Locations</h1>
        <button className={styles.newLocationButton}>+ New Location</button>
      </div>
      <div className={styles.searchAndSort}>
        <input
          type="text"
          placeholder="Search for route"
          className={styles.searchInput}
        />
        <div className={styles.filterControls}>
          <h1>Sorted:</h1>
          <select className={styles.sortSelect} value={sortOption} onChange={handleSortChange}>
            <option value="alphabetically">Alphabetically</option>
            <option value="byType">By Type</option>
          </select>
          <button className={styles.filterButton}>Filter</button>
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
  );
};

export default LocationDashboardPage;
