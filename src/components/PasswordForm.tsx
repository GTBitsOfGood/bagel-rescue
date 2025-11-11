"use client";

import { useEffect, useState } from 'react';
import styles from "./PasswordForm.module.css";
import { useRouter } from 'next/navigation';
import { auth } from '../server/db/firebase';
import { signOut, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getUserByEmail } from '../server/db/actions/User';
import { updatePassword } from "firebase/auth";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const PasswordForm: React.FC = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    role: 'Volunteer',
  });

  const [loading, setLoading] = useState(true);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [correctPassword, setCorrectPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [seePassword, setSeePassword] = useState(false);
  const [seeNewPassword, setSeeNewPassword] = useState(false);

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
              role: mongoUser.isAdmin ? 'Admin' : 'Volunteer',
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

  useEffect(() => {
    if (!password) {
      return;
    }

    const timer = setTimeout(async() => {
      await checkPassword();
    }, 500)

    return () => clearTimeout(timer);
  }, [password]);

  const checkPassword = async () => {
    try { 
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
          const credential = EmailAuthProvider.credential(currentUser.email, password);
          await reauthenticateWithCredential(currentUser, credential);
          setCorrectPassword(true);
        }
    } catch (error) {
      console.error('Error checking password:', error);
      setCorrectPassword(false);
    }
  }

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

  const handleChangePassword = async () => {
    if (auth && auth.currentUser) {
        updatePassword(auth.currentUser, newPassword).then(() => {
            setIsChangingPassword(false);
            setPassword('');
            setNewPassword('');
            setCorrectPassword(false);
            setSeePassword(false);
            setSeeNewPassword(false);
        }).catch((error) => {
            console.error('Error changing password:', error);
        });
    }
  }

  if (loading) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ul className={styles.menu}>
          <li className={styles.menuItem} onClick={() => router.back()}>Profile</li>
          <li className={`${styles.menuItem} ${styles.active}`}>Password</li>
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
        {isChangingPassword ? (
          <div>
              <div className={styles.top}>
                  <div>
                      <h2 className={styles.name}>{`${userData.firstName} ${userData.lastName}`}</h2>
                      <p className={styles.role}>{userData.role}</p>
                  </div>
                  <button className={styles.changeButton} 
                      disabled={!(correctPassword && newPassword.length >= 6)}
                      onClick={handleChangePassword}>
                      Change Password
                  </button>
              </div>
              <hr className={styles.line}></hr>
              <form className={styles.form}>
                <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Old Password</label>
                      <div className={styles.passwordBox}>
                        <input
                            type={!seePassword ? "password" : "text"}
                            name="password"
                            value={password}
                            className={`${styles.fieldInput} ${correctPassword ? styles.correct : password.length != 0 ? styles.incorrect : ''}`}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={checkPassword}
                        />
                        <button type="button" className={styles.eyeButton}
                          onClick={() => setSeePassword(!seePassword)} >
                          {seePassword ? (
                            <IoEyeOutline className="text-gray-400" size={20} />
                          ) : (
                            <IoEyeOffOutline className="text-gray-400" size={20} />
                          )}
                        </button>
                      </div>
                    {!correctPassword && password.length != 0 && (
                    <p className={styles.incorrectText}>Old password is not correct</p>
                    )}  
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>New Password</label>
                      <div className={styles.passwordBox}>
                        <input
                          type={!seeNewPassword ? "password" : "text"}
                          name="newPassword"
                          className={styles.fieldInput}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button type="button" className={styles.eyeButton}
                          onClick={() => setSeeNewPassword(!seeNewPassword)} >
                          {seeNewPassword ? (
                            <IoEyeOutline className="text-gray-400" size={20} />
                          ) : (
                            <IoEyeOffOutline className="text-gray-400" size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
              </form>
          </div>
      ) : (
          <div>
              <div className={styles.top}>
                  <div>
                      <h2 className={styles.name}>{`${userData.firstName} ${userData.lastName}`}</h2>
                      <p className={styles.role}>{userData.role}</p>
                  </div>
                  <button className={styles.changeButton} onClick={() => setIsChangingPassword(true)}>
                      Change Password
                  </button>
              </div>
              <hr className={styles.line}></hr>
              <div className={styles.form}>
                  <div className={styles.field}>
                  <label className={styles.fieldLabel}>Password</label>
                  <input
                      type="text"
                      name="password"
                      className={styles.disabledInput}
                      value={`${'*'.repeat(12)}`}
                      disabled
                  />
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordForm;
