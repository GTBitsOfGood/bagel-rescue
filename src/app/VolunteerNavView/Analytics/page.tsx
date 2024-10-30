'use client'

import Sidebar from '../../../components/Sidebar';
import styles from './page.module.css';

const Analytics: React.FC = () => {
  return (
    <div className={styles.container}>
      <Sidebar />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <button 
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            &lt; Back
          </button>
          <h1 className={styles.pageTitle}>Analytics</h1>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
