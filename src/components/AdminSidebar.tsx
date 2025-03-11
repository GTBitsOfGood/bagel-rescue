'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Sidebar.module.css'; 
import { FiHome, FiUser, } from 'react-icons/fi';
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { CiRoute, CiLocationOn } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/AdminNavView/DailyShiftDashboard', icon: <FiHome /> },
  { name: 'Routes', href: '/AdminNavView/RouteDashboard', icon: <FontAwesomeIcon icon={faRoute} /> },
  { name: 'Locations', href: '/AdminNavView/LocationPage', icon: <CiLocationOn /> },
  { name: 'Analytics', href: '/AdminNavView/AnalyticsPage', icon: <TbBrandGoogleAnalytics /> },

];

const AdminSidebar: React.FC = () => {
  const pathname = usePathname(); 
  const [isOpen, setIsOpen] = useState<boolean>(true); 

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <Link href="/AdminNavView/DailyShiftDashboard">
      <div className={styles.navHeader}>
        <div className={styles.navIcon}>🥯</div>
        <div className={styles.navHeaderText}>Bagel Rescue</div>
        <div className={styles.navTitleText}>Admin Portal</div>
      </div>

      
      </Link>
      
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.name} href={item.href}>
            <div
              className={`${styles.navItem} ${
                pathname === item.href ? styles.active : ''
              }`}
            >
              <div className={styles.icon}>{item.icon}</div>
              {isOpen && <span className={styles.navText}>{item.name}</span>}
            </div>
          </Link>
        ))}
      </nav>
      <Link href="/AdminNavView/AdminProfile">
      <div className={styles.profile}>
          <div className={styles.avatar}></div>
          {isOpen && (
            <div className={styles.profileInfo}>
              <p className={styles.name}>Jane Doe</p>
              <p className={styles.role}>Admin</p>
            </div>
          )}
        </div>
      
      </Link>
      
    </div>
  );
};

export default AdminSidebar;
