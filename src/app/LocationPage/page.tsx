"use client";

import React from 'react';
import styles from './page.module.css';

const locations = [
  {
    name: 'Location Name',
    contact: '123-456-7890',
    address: '1234 Address Name, Apt. 56, Atlanta, GA',
    type: 'Drop-Off',
    bags: 1234,
    notes: 'Additional Notes are placed here, and will include info about that in case it’s necessary, so this is where that...',
  },
  {
    name: 'Location Name',
    contact: '123-456-7890',
    address: '1234 Address Name, Apt. 56, Atlanta, GA',
    type: 'Pick-Up',
    bags: 1234,
    notes: 'Additional Notes are placed here, and will include info about that in case it’s necessary, so this is where that...',
  },
];

const Dashboard = () => {
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
          <select className={styles.sortSelect}>
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
                  <strong>{location.name}</strong>
                  <div>{location.contact}</div>
                </div>
                <div className={styles.locationInfo}>{location.address}</div>
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

export default Dashboard;
