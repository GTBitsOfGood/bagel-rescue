// src/components/AdminProfileForm.tsx
"use client";

import styles from "./ProfileForm.module.css";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const ProfileForm: React.FC = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      // Sign out via NextAuth; note we set the callbackUrl to '/' so that after sign-out the user is taken to the homepage.
      await signOut({
        redirect: true,
        callbackUrl: "/", // change this to your homepage if different
      });
      // (Optional) Force client refresh if needed
      router.push("/");
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
          <li
            className={`${styles.menuItem} ${styles.signOut}`}
            onClick={handleSignOut}
            style={{ cursor: "pointer" }}
          >
            Sign Out
          </li>
        </ul>
      </div>

      <div className={styles.formContainer}>
        <h2 className={styles.name}>Jane Doe</h2>
        <p className={styles.role}>Admin</p>

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
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
