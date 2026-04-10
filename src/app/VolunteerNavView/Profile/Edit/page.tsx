"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../server/db/firebase';
import { signOut } from 'firebase/auth';
import EditProfileForm from '../../../../components/EditProfileForm';
import Sidebar from "../../../../components/Sidebar";
import styles from "./page.module.css";
import BackButton from '@/app/components/BackButton';
import UnsavedChangesModal from '@/app/components/UnsavedChangesModal';

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [popup, setPopup] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingSignOut, setPendingSignOut] = useState(false);

  const togglePopup = () => {
    setPopup(!popup);
  }

  const handleCancel = () => {
    if (hasChanges) {
      setPendingNavigation(null);
      setPendingSignOut(false);
      togglePopup();
    } else {
      window.history.back();
    }
  }

  const handleNavigate = (path: string) => {
    if (hasChanges) {
      setPendingNavigation(path);
      setPendingSignOut(false);
      setPopup(true);
    } else {
      router.push(path);
    }
  }

  const doSignOut = async () => {
    try {
      await signOut(auth);
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.push('/Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const handleSignOutRequest = () => {
    if (hasChanges) {
      setPendingNavigation(null);
      setPendingSignOut(true);
      setPopup(true);
    } else {
      doSignOut();
    }
  }

  const handleLoseChanges = () => {
    if (pendingSignOut) {
      doSignOut();
    } else if (pendingNavigation) {
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
          <EditProfileForm togglePopup={handleCancel} setHasChanges={setHasChanges} onNavigate={handleNavigate} onSignOut={handleSignOutRequest} />
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={popup}
        onConfirm={handleLoseChanges}
        onCancel={togglePopup}
      />
    </div>
  );
};

export default EditProfile;
