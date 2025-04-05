"use client";

import { useEffect, useState } from 'react';
import styles from "./ProfileForm.module.css";
import { useRouter } from 'next/navigation';
import { auth } from '../server/db/firebase';
import { signOut } from 'firebase/auth';
import { getUserByEmail } from '../server/db/actions/User';

const ProfileForm: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    location: '',
    role: 'Volunteer'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
          const mongoUser = await getUserByEmail(currentUser.email);
          if (mongoUser) {
            setUserData({
              firstName: mongoUser.firstName || '',
              lastName: mongoUser.lastName || '',
              email: currentUser.email || '',
              phoneNumber: mongoUser.phoneNumber || '(123) 456-7890',
              location: mongoUser.location || 'Alpharetta, GA',
              role: mongoUser.isAdmin ? 'Admin' : 'Volunteer'
            });
          }
        } else {
          // If no user is logged in, redirect to login
          router.push('/Login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/Login'); // Redirect to login page after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading profile...</div>;
  }

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
        <h2 className={styles.name}>{`${userData.firstName} ${userData.lastName}`}</h2>
        <p className={styles.role}>{userData.role}</p>

        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>First Name</label>
              <input
                type="text"
                className={styles.fieldInput}
                value={userData.firstName}
                disabled
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Last Name</label>
              <input
                type="text"
                className={styles.fieldInput}
                value={userData.lastName}
                disabled
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Location</label>
            <input
              type="text"
              className={styles.fieldInput}
              value={userData.location}
              disabled
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input
                type="text"
                className={styles.fieldInput}
                value={userData.phoneNumber}
                disabled
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                type="email"
                className={styles.fieldInput}
                value={userData.email}
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
