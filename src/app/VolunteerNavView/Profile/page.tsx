"use client";

import Sidebar from "../../../components/Sidebar";
import ProfileForm from "../../../components/ProfileForm";
import styles from "./page.module.css";
const Profile: React.FC = () => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <button
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            &lt; Back
          </button>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Account</h1>
          </div>
        </div>
        <div className={styles.backDrop}>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default Profile;
