"use client";

import PasswordForm from '../../../../components/PasswordForm';
import Sidebar from "../../../../components/Sidebar";
import styles from "./page.module.css";

const ChangePassword: React.FC = () => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <button className={styles.backButton} onClick={() => window.history.back()}>
            &lt; Back
          </button>
          <div className={styles.header}>
            <h1 className={styles.pageTitle}>Account</h1>
          </div>
        </div>
        <div className={styles.backDrop}>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
