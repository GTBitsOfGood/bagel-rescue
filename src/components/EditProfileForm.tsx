"use client";

import { useEffect, useState } from 'react';
import styles from "./EditProfileForm.module.css";
import { useRouter } from 'next/navigation';
import { auth } from '../server/db/firebase';
import { signOut, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getUserByEmail, updateUser } from '../server/db/actions/User';
import location from '../lib/locations'
import { IUser } from '@/server/db/models/User';

interface EditProfileFormProps {
  togglePopup: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ togglePopup }) => {
  const router = useRouter();
  const [initialName, setInitialName] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [editLocation, setEditLocation] = useState(false);
  const [askPassword, setAskPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'Volunteer',
    prefersNormalRoutes: false,
    prefersSubOnly: false,
    openToAny: false
  });
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser && currentUser.email) {
          const mongoUser = await getUserByEmail(currentUser.email);
          if (mongoUser) {
            setInitialName(`${mongoUser.firstName} ${mongoUser.lastName}`);
            setUserData({
              firstName: mongoUser.firstName || '',
              lastName: mongoUser.lastName || '',
              email: currentUser.email || '',
              phoneNumber: mongoUser.phoneNumber || '(123) 456-7890',
              role: mongoUser.isAdmin ? 'Admin' : 'Volunteer',
              prefersNormalRoutes: mongoUser.prefersNormalRoutes ? true : false,
              prefersSubOnly: mongoUser.prefersSubOnly ? true : false,
              openToAny: mongoUser.openToAny ? true : false,
            });
            setLocations(mongoUser.locations || []);
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

      await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      router.push('/Login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  const addLocation = (loc: string) => {
    if (!locations.includes(loc)) {
      setLocations((prev) => [...prev, loc]);
    }
  }

  const removeLocation = (loc: string) => {
    setLocations((prev) => prev.filter((location) => location !== loc));
  }

  const changeEmail = async () => {
    setAskPassword(false);
    if (!currentUser || !currentUser.email) {
      router.push('/Login');
      return;
    }

    if (auth.currentUser) {
      try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        await verifyBeforeUpdateEmail(auth.currentUser, userData.email);
        saveProfile();
      } catch (error) {
        console.error("Error updating email: ", error);
      }
    }
  }

  const saveProfile = async () => {
    try {
      if (!currentUser || !currentUser.email) {
        router.push('/Login');
        return;
      }

      const mongoUser = await getUserByEmail(currentUser.email);
      if (mongoUser && mongoUser._id) {
        const mongoose = await import('mongoose');
        const updated: Partial<IUser> = {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          email: currentUser.email,
          locations: locations,
          prefersNormalRoutes: userData.prefersNormalRoutes,
          prefersSubOnly: userData.prefersSubOnly,
          openToAny: userData.openToAny,
        }

        if (currentUser.email !== userData.email) {
          updated.newEmail = userData.email;
        }

        await updateUser(new mongoose.Types.ObjectId(mongoUser._id.toString()), updated);
      }
    } catch (error) {
      console.error('Error editing user data:', error);
    }
    router.back();
  }

  const updateInformation = () => {
    if (currentUser) {
      if (currentUser.email !== userData.email) {
        setAskPassword(true);
      } else {
        saveProfile();
      }
    }
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
        <div className={styles.top}>
          <div>
            <h2 className={styles.name}>{`${initialName}`}</h2>
            <p className={styles.role}>{userData.role}</p>
          </div>
          <div className={styles.save}>
            <button className={styles.cancel} onClick={togglePopup}>Cancel</button>
            <button className={styles.button} onClick={updateInformation}>Save Profile</button>
          </div>
        </div>
        <hr className={styles.line}></hr>

        {askPassword && (
          <div className={styles.popupBack}>
            <div className={styles.popup}>
              <h1 className={styles.passwordStatement}>Please enter your password <br /> to send verification email.</h1>
              <input type="password" value={password} className={styles.passwordBox} onChange={(e) => setPassword(e.target.value)} />
              <div className={styles.popupButtons}>
                <button className={styles.cancelChanges} onClick={() => setAskPassword(false)}>Cancel</button>
                <button className={styles.saveChanges} onClick={changeEmail}>Save</button>
              </div>
            </div>
          </div>
        )}

        <form className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>First Name</label>
              <input
                type="text"
                name="firstName"
                className={styles.fieldInput}
                value={userData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Last Name</label>
              <input
                type="text"
                name="lastName"
                className={styles.fieldInput}
                value={userData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                className={styles.fieldInput}
                value={userData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.fieldInput}
                value={userData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Location Preferences</label>
            <div className={styles.locationContainer} 
              onClick={() => setEditLocation(!editLocation)}>
              {locations.map((loc) => (
                <div className={styles.locationBox} key={loc}>
                  <label>{loc}</label>
                  <button className={styles.buttonX} 
                    onClick={() => removeLocation(loc)}>
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {editLocation &&
            <div className={styles.locationDropdown}>
              <label className={styles.locationLabel}>Select a location</label>
              <div className={styles.locationList}>
                  {location.map((loc) => (
                    <button 
                      type="button" 
                      className={styles.locationSelect} 
                      key={loc} 
                      onClick={() => addLocation(loc)}
                    >
                      {loc}
                    </button>
                  ))}
              </div>
            </div>
          }

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Volunteering Preferences</label>
            <div className={styles.checkboxes}>
              <div className={styles.checkboxLabel}>
                <input 
                  type='checkbox'
                  name='prefersNormalRoutes'
                  className={styles.checkbox}
                  checked={userData.prefersNormalRoutes}
                  onChange={handleCheckboxChange}
                  /> Normal Routes
              </div>
              <div className={styles.checkboxLabel}>
                <input 
                  type='checkbox'
                  name='prefersSubOnly'
                  className={styles.checkbox}
                  checked={userData.prefersSubOnly}
                  onChange={handleCheckboxChange}
                  /> Sub Only
              </div>
              <div className={styles.checkboxLabel}>
                <input 
                  type='checkbox'
                  name='openToAny'
                  className={styles.checkbox}
                  checked={userData.openToAny}
                  onChange={handleCheckboxChange}
                  /> Open to Any
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileForm;
