'use client'

import AdminSidebar from '../../../components/AdminSidebar';
import AdminProfileForm from '../../../components/AdminProfileForm';
import styles from './page.module.css';
const AdminProfile: React.FC = () => {
  return (
    <div className={styles.container}>
      <AdminSidebar />

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
        <AdminProfileForm />
      </div>
      </div>
    </div>
  );
};

export default AdminProfile;
