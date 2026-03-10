"use client";

import { useEffect, useState } from 'react';
import styles from "./ProfileForm.module.css";
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../server/db/firebase';
import { signOut } from 'firebase/auth';
import { getUserByEmail } from '../server/db/actions/User';
import { PiPencil } from "react-icons/pi";
import LoadingFallback from '@/app/components/LoadingFallback';

const ProfileForm: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    locations: [] as string[],
    role: 'Volunteer',
    prefersNormalRoutes: false,
    prefersSubOnly: false,
    openToAny: false
  });
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

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
              locations: mongoUser.locations || [],
              role: mongoUser.isAdmin ? 'Admin' : 'Volunteer',
              prefersNormalRoutes: mongoUser.prefersNormalRoutes ? true : false,
              prefersSubOnly: mongoUser.prefersSubOnly ? true : false,
              openToAny: mongoUser.openToAny ? true : false,
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
      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      router.push('/Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingFallback />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ul className={styles.menu}>
          <li className={`${styles.menuItem} ${styles.active}`}>Profile</li>
          <li className={styles.menuItem} onClick={() => router.push(`${pathname}/Password`)}>Password</li>
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
        <div className={styles.top}>
          <div>
            <h2 className={styles.name}>{`${userData.firstName} ${userData.lastName}`}</h2>
            <p className={styles.role}>{userData.role}</p>
          </div>
          <button className={styles.savebutton} onClick={() => router.push(`${pathname}/Edit`)}>
            <PiPencil /> Edit Profile
          </button>
        </div>
        <hr className={styles.line}></hr>

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

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Location Preferences</label>
            <div className={styles.locationContainer}>
              {userData.locations.map((loc) => (
                <div className={styles.locationBox} key={loc}>
                  <label>{loc}</label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Volunteering Preferences</label>
              <div className={styles.checkboxes}>
                <div className={styles.checkboxContainer}>
                  <input 
                    type='checkbox'
                    name='prefersNormalRoutes'
                    className={styles.checkbox}
                    checked={userData.prefersNormalRoutes}
                    /> 
                    <span className={styles.checkboxLabel}>Normal Routes</span>
                </div>
                <div className={styles.checkboxContainer}>
                  <input 
                    type='checkbox'
                    name='prefersSubOnly'
                    className={styles.checkbox}
                    checked={userData.prefersSubOnly}
                    /> 
                    <span className={styles.checkboxLabel}>Sub Only</span>
                </div>
                <div className={styles.checkboxContainer}>
                  <input 
                    type='checkbox'
                    name='openToAny'
                    className={styles.checkbox}
                    checked={userData.openToAny}
                    /> 
                    <span className={styles.checkboxLabel}>Open to Any</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
