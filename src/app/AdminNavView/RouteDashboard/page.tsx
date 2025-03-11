"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faAngleLeft, 
  faMagnifyingGlass, 
  faPlus 
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";

import { getAllRoutes } from "@/server/db/actions/Route";
import { IRoute } from "@/server/db/models/Route";
import AdminSidebar from "../../../components/AdminSidebar";
import styles from "./page.module.css";
import "./stylesheet.css";

export default function RouteDashboardPage() {
  const [routes, setRoutes] = useState<IRoute[]>([]);
  const [sortOption, setSortOption] = useState<string>('alphabetically');
  const [searchText, setSearchText] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await getAllRoutes();
        const data = JSON.parse(response || "[]");
        setRoutes(data || []);
      } catch (error) {
        console.error("Error fetching routes:", error);
        setRoutes([]);
      }
    };
    fetchRoutes();
  }, []);

  const handleSortChange = () => {
    const sortedRoutes = [...routes];
    if (sortOption === 'alphabetically') {
      sortedRoutes.sort((a: IRoute, b: IRoute) => 
        a.routeName.localeCompare(b.routeName)
      );
    } else if (sortOption === 'byArea') {
      sortedRoutes.sort((a: IRoute, b: IRoute) => 
        a.locationDescription.localeCompare(b.locationDescription)
      );
    }
    setRoutes(sortedRoutes);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(event.target.value);
  };

  const getFilteredRoutes = () => {
    return routes.filter(route => 
      route.routeName.toLowerCase().includes(searchText.toLowerCase()) ||
      route.locationDescription.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <div className="container">
          <button className="back-btn" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faAngleLeft} />
            <p>Back</p>
          </button>
          <div className="header">
            <p className="header-text">Routes</p>
            <button 
              className="complete-route-btn" 
              style={{ backgroundColor: "#3d97ff", cursor: "pointer" }}
              onClick={() => router.push("/AdminNavView/RouteCreationPage")}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              New Route
            </button>
          </div>
          <hr className="separator" />
          <div className={styles.container}>
            <div className={styles.searchAndSort}>
              <div className={styles.searchInputContainer}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search for route"
                  className={styles.searchInput}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <div className={styles.filterControls}>
                <h1>Sorted:</h1>
                <select 
                  className={styles.sortSelect}
                  value={sortOption} 
                  onChange={handleFilterChange}
                >
                  <option value="alphabetically">Alphabetically</option>
                  <option value="byArea">By Area</option>
                </select>
                <button 
                  className={styles.filterButton} 
                  onClick={handleSortChange}
                >
                  Filter
                </button>
              </div>
            </div>
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}>
                <div className={styles.columnHeader}>Route Name</div>
                <div className={styles.columnHeader}>Area</div>
                <div className={styles.columnHeader}>Number of Stops</div>
                <div className={styles.columnHeader}>Additional Information</div>
                <div className={styles.columnHeader}></div>
              </div>
              <div className={styles.routeList}>
                {getFilteredRoutes().map((route, index) => (
                  <div key={index} className={styles.routeCard}>
                    <div className={styles.routeDetails}>
                      <div className={styles.routeInfo}>
                        <strong>{route.routeName}</strong>
                      </div>
                      <div className={styles.routeInfo}>
                        {route.locationDescription}
                      </div>
                      <div className={styles.routeInfo}>
                        {route.locations.length}
                      </div>
                      <div className={styles.routeInfo}>
                        {/* Additional information would go here */}
                      </div>
                      <button className={styles.moreOptionsButton}>⋮</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}