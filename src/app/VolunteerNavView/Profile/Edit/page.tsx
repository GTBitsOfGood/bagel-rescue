"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProfileForm from '../../../../components/EditProfileForm';
import Sidebar from "../../../../components/Sidebar";
import styles from "./page.module.css";
import BackButton from '@/app/components/BackButton';

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [popup, setPopup] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const togglePopup = () => {
    setPopup(!popup);
    if (popup) setPendingNavigation(null);
  }

  const handleCancel = () => {
    if (hasChanges) {
      setPendingNavigation(null);
      togglePopup();
    } else {
      window.history.back();
    }
  }

  const handleNavigate = (path: string) => {
    if (hasChanges) {
      setPendingNavigation(path);
      setPopup(true);
    } else {
      router.push(path);
    }
  }

  const handleLoseChanges = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    } else {
      window.history.back();
    }
  }

  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <BackButton onClick={handleCancel}/>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Account</h1>
          </div>
        </div>
        <div className={styles.backDrop}>
          <EditProfileForm togglePopup={handleCancel} setHasChanges={setHasChanges} onNavigate={handleNavigate} />
        </div>
      </div>

      {popup && (
        <div className={styles.popupBack}>
          <div className={styles.popup}>
            <h1 className={styles.question}>Are you sure you want to return?</h1>
            <p className={styles.unsaved}>Your unsaved changes will be lost.</p>
            <div className={styles.popupButtons}>
              <button className={styles.loseChanges} onClick={handleLoseChanges}>Lose Changes</button>
              <button className={styles.continueEdit} onClick={togglePopup}>Continue editing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
