'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Sidebar.module.css'; 
import { FiHome, FiUser, } from 'react-icons/fi';
import { TbBrandGoogleAnalytics } from "react-icons/tb";

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/homepage', icon: <FiHome /> },
  { name: 'Analytics', href: '/analytics', icon: <TbBrandGoogleAnalytics /> },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Get the current route
  const [isOpen, setIsOpen] = useState<boolean>(true); // State to control collapse

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <button onClick={toggleSidebar} className={styles.toggleButton}>
        {isOpen ? 'Collapse' : 'Expand'}
      </button>
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
    </div>
  );
};

export default Sidebar;
