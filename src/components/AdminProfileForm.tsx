'use client'

import styles from './ProfileForm.module.css';

const ProfileForm: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ul className={styles.menu}>
          <li className={`${styles.menuItem} ${styles.active}`}>Profile</li>
          <li className={`${styles.menuItem} ${styles.signOut}`}>Sign Out</li>
        </ul>
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.name}>Jane Doe</h2>
        <p className={styles.role}>Admin</p>

        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>First Name</label>
              <input type="text" className={styles.fieldInput} value='"Jane"' disabled />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Last Name</label>
              <input type="text" className={styles.fieldInput} value='"Doe"' disabled />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
