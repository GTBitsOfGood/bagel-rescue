"use client";

import { useState } from 'react';
import EditProfileForm from '../../../../components/EditProfileForm';
import Sidebar from "../../../../components/Sidebar";
import styles from "./page.module.css";

const EditProfile: React.FC = () => {
  const [popup, setPopup] = useState(false);

  const togglePopup = () => {
    setPopup(!popup);
  }

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <button
            className={styles.backButton}
            onClick={togglePopup}
          >
            &lt; Back
          </button>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Account</h1>
          </div>
        </div>
        <div className={styles.backDrop}>
          <EditProfileForm togglePopup={togglePopup} />
        </div>
      </div>
      
      {popup && (
        <div className={styles.popupBack}>
          <div className={styles.popup}>
            <h1 className={styles.question}>Are you sure you want to return?</h1>
            <p className={styles.unsaved}>Your unsaved changes will be lost.</p>
            <div className={styles.popupButtons}>
              <button className={styles.loseChanges} onClick={() => window.history.back()}>Lose Changes</button>
              <button className={styles.continueEdit} onClick={togglePopup}>Continue editing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
