'use client'

import { useEffect, useState } from 'react';
import styles from './ProfileForm.module.css';
import { useRouter } from 'next/navigation';
import { auth } from '../server/db/firebase';
import { signOut } from 'firebase/auth';
import { getUserByEmail } from '../server/db/actions/User';
import LoadingFallback from '@/app/components/LoadingFallback';

const ProfileForm: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    role: 'Admin'
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
              role: mongoUser.isAdmin ? 'Admin' : 'User'
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
              <input type="text" className={styles.fieldInput} value={userData.firstName} disabled />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Last Name</label>
              <input type="text" className={styles.fieldInput} value={userData.lastName} disabled />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
