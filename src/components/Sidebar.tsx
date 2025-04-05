"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { FiHome, FiUser } from "react-icons/fi";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { auth } from '../server/db/firebase';
import { getUserByEmail } from '../server/db/actions/User';

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/VolunteerNavView/Homepage", icon: <FiHome /> },
  {
    name: "Analytics",
    href: "/VolunteerNavView/Analytics",
    icon: <TbBrandGoogleAnalytics />,
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    role: 'Volunteer'
  });

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
              role: mongoUser.isAdmin ? 'Admin' : 'Volunteer'
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
      <Link href="/VolunteerNavView/Homepage">
        <div className={styles.navHeader}>
          <div className={styles.navIcon}>🥯</div>
          <div className={styles.navHeaderText}>Bagel Rescue</div>
          <div className={styles.navTitleText}>Volunteer Portal</div>
        </div>
      </Link>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={`${styles.navItem} ${
                pathname === item.href ? styles.active : ""
              }`}
            >
              <div className={styles.icon}>{item.icon}</div>
              {isOpen && <span className={styles.navText}>{item.name}</span>}
            </div>
          </Link>
        ))}
      </nav>
      <Link href="/VolunteerNavView/Profile">
        <div className={styles.profile}>
          <div className={styles.avatar}></div>
          {isOpen && (
            <div className={styles.profileInfo}>
              <p className={styles.name}>{`${userData.firstName} ${userData.lastName}`}</p>
              <p className={styles.role}>{userData.role}</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
