"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { FiHome, FiUser } from "react-icons/fi";
import { TbBrandGoogleAnalytics, TbRoute } from "react-icons/tb";
import { CiRoute, CiLocationOn } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../server/db/firebase";
import { getUserByEmail } from "../server/db/actions/User";
import { FaPeopleLine } from "react-icons/fa6";

interface NavItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/AdminNavView/DailyShiftDashboard",
    icon: <FiHome size={24} strokeWidth={1.5} />,
  },
  {
    name: "Routes",
    href: "/AdminNavView/RouteDashboard",
    icon: <FontAwesomeIcon icon={faRoute} width={24} height={24} />,
    // icon: <TbRoute size={20} />,
  },
  {
    name: "Locations",
    href: "/AdminNavView/LocationPage",
    icon: <CiLocationOn size={24} strokeWidth={1} />,
  },
  {
    name: "Analytics",
    href: "/AdminNavView/AdminAnalytics",
    icon: <TbBrandGoogleAnalytics size={24} strokeWidth={1.5} />,
  },
  {
    name: "Management",
    href: "/AdminNavView/ManagementPage",
    icon: <FaPeopleLine size={24} strokeWidth={1.5} />,
  },
];

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "Admin",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.email) {
          const mongoUser = await getUserByEmail(currentUser.email);
          if (mongoUser) {
            setUserData({
              firstName: mongoUser.firstName || "",
              lastName: mongoUser.lastName || "",
              role: mongoUser.isAdmin ? "Admin" : "User",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
    >
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
                pathname === item.href ? styles.active : ""
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
              <p
                className={styles.name}
              >{`${userData.firstName} ${userData.lastName}`}</p>
              <p className={styles.role}>{userData.role}</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default AdminSidebar;
