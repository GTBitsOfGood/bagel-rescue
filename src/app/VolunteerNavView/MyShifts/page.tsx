"use client";

import Sidebar from "../../../components/Sidebar";
import styles from "./page.module.css";

const MyShifts: React.FC = () => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>My Shifts</h1>
        </div>
      </div>
    </div>
  );
};

export default MyShifts;
