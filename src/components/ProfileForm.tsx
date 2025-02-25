"use client";

import styles from "./ProfileForm.module.css";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const ProfileForm: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log("Signing out..."); // Debug log
      const result = await signOut({
        redirect: true,
        callbackUrl: '/Login'
      });
      console.log("Sign out result:", result); // Debug log
      
      // Force redirect if the automatic redirect doesn't work
      router.push('/Login');
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ul className={styles.menu}>
          <li className={`${styles.menuItem} ${styles.active}`}>Profile</li>
          <li className={styles.menuItem}>Password</li>
          <li 
            className={`${styles.menuItem} ${styles.signOut}`}
            onClick={handleSignOut}
            style={{ cursor: 'pointer' }}
          >
            Sign Out
          </li>
        </ul>
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.name}>Jane Doe</h2>
        <p className={styles.role}>Volunteer</p>

        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>First Name</label>
              <input
                type="text"
                className={styles.fieldInput}
                value='"Jane"'
                disabled
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Last Name</label>
              <input
                type="text"
                className={styles.fieldInput}
                value='"Doe"'
                disabled
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Location</label>
            <input
              type="text"
              className={styles.fieldInput}
              value="Alpharetta, GA"
              disabled
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input
                type="text"
                className={styles.fieldInput}
                value="(123) 456-7890"
                disabled
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                type="email"
                className={styles.fieldInput}
                value="blank@email.com"
                disabled
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
