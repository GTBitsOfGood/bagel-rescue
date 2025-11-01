'use client'

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Shift } from '@/server/db/models/shift';
import { getAllShifts } from '@/server/db/actions/shift';
import { IRoute } from '@/server/db/models/Route';
import { getAllRoutesbyIds } from '@/server/db/actions/Route';
import DashboardHeader from '../../components/DailyDashboard';
import DailyShiftBar from '../../components/DailyShiftBar';
import AdminSidebar from '../../../components/AdminSidebar';
import ShiftSidebar, { ShiftSidebarInfo } from '@/app/components/ShiftSidebar';
import { Location } from '@/server/db/models/location';
import { ILocation } from '@/server/db/models/Route';
import { getAllLocationsById } from '@/server/db/actions/location';
import styles from '@/app/VolunteerNavView/Homepage/page.module.css';

// Filter Icon Component
const FilterIcon = () => (
  <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0.125 7C0.125 6.83424 0.190848 6.67527 0.308058 6.55806C0.425269 6.44085 0.58424 6.375 0.75 6.375H6.375C6.54076 6.375 6.69973 6.44085 6.81694 6.55806C6.93415 6.67527 7 6.83424 7 7C7 7.16576 6.93415 7.32474 6.81694 7.44195C6.69973 7.55916 6.54076 7.625 6.375 7.625H0.75C0.58424 7.625 0.425269 7.55916 0.308058 7.44195C0.190848 7.32474 0.125 7.16576 0.125 7ZM0.75 2.625H5.125C5.29076 2.625 5.44973 2.55916 5.56694 2.44195C5.68415 2.32473 5.75 2.16576 5.75 2C5.75 1.83424 5.68415 1.67527 5.56694 1.55806C5.44973 1.44085 5.29076 1.375 5.125 1.375H0.75C0.58424 1.375 0.425269 1.44085 0.308058 1.55806C0.190848 1.67527 0.125 1.83424 0.125 2C0.125 2.16576 0.190848 2.32473 0.308058 2.44195C0.425269 2.55916 0.58424 2.625 0.75 2.625ZM11.375 11.375H0.75C0.58424 11.375 0.425269 11.4409 0.308058 11.5581C0.190848 11.6753 0.125 11.8342 0.125 12C0.125 12.1658 0.190848 12.3247 0.308058 12.4419C0.425269 12.5592 0.58424 12.625 0.75 12.625H11.375C11.5408 12.625 11.6997 12.5592 11.8169 12.4419C11.9342 12.3247 12 12.1658 12 12C12 11.8342 11.9342 11.6753 11.8169 11.5581C11.6997 11.4409 11.5408 11.375 11.375 11.375ZM14.9422 3.43282L11.8172 0.307816C11.7591 0.249706 11.6902 0.203606 11.6143 0.172154C11.5385 0.140701 11.4571 0.124512 11.375 0.124512C11.2929 0.124512 11.2115 0.140701 11.1357 0.172154C11.0598 0.203606 10.9909 0.249706 10.9328 0.307816L7.80781 3.43282C7.69054 3.55009 7.62465 3.70915 7.62465 3.875C7.62465 4.04086 7.69054 4.19992 7.80781 4.31719C7.92509 4.43447 8.08415 4.50035 8.25 4.50035C8.41585 4.50035 8.57491 4.43447 8.69219 4.31719L10.75 2.2586V8.25C10.75 8.41576 10.8158 8.57474 10.9331 8.69195C11.0503 8.80916 11.2092 8.875 11.375 8.875C11.5408 8.875 11.6997 8.80916 11.8169 8.69195C11.9342 8.57474 12 8.41576 12 8.25V2.2586L14.0578 4.31719C14.1159 4.37526 14.1848 4.42132 14.2607 4.45275C14.3366 4.48418 14.4179 4.50035 14.5 4.50035C14.5821 4.50035 14.6634 4.48418 14.7393 4.45275C14.8152 4.42132 14.8841 4.37526 14.9422 4.31719C15.0003 4.25912 15.0463 4.19018 15.0777 4.11431C15.1092 4.03844 15.1253 3.95713 15.1253 3.875C15.1253 3.79288 15.1092 3.71156 15.0777 3.63569C15.0463 3.55982 15.0003 3.49088 14.9422 3.43282Z" fill="#072B68"/>
  </svg>
);

function DailyShiftDashboardPage() {

  const [search, setSearch] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [routes, setRoutes] = useState<{ [key: string]: IRoute }>({});
  const [locations, setLocations] = useState<{ [key: string]: string[] }>({});
  const [selectedItem, setSelectedItem] = useState<ShiftSidebarInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"assigned" | "open">("assigned");

  const handleDeleteShift = (shift: Shift) => {
    // TODO: Implement delete shift functionality
    console.log('Delete shift:', shift);
    // You can add confirmation dialog here
    if (confirm('Are you sure you want to delete this shift?')) {
      // Call delete API here
      console.log('Confirmed deletion of shift:', shift._id);
    }
  };

  useEffect(() => {
    const fetchShifts = async () => {
      const response = await getAllShifts();
      const data = JSON.parse(response || "[]");

      setShifts(data || []);

      const routeIds = data.map((shift: Shift) => shift.routeId);

      const routeResponse = await getAllRoutesbyIds(routeIds);
      const routeData = JSON.parse(routeResponse || "[]");
      const routeMap: { [key: string]: IRoute } = {};
      routeData.forEach((route: IRoute) => {
        routeMap[String(route._id)] = route;
      });
      setRoutes(routeMap);

      // Collect all location IDs from all routes
      const allLocationIds: string[] = [];
      routeData.forEach((route: IRoute) => {
        route.locations.forEach((location: ILocation) => {
          allLocationIds.push(String(location.location));
        });
      });

      try {
        const locationsResponse = await getAllLocationsById(allLocationIds);
        const locationsData = JSON.parse(locationsResponse || "[]");
        
        // Create a map of location ID to location name
        const locationNameMap: { [key: string]: string } = {};
        locationsData.forEach((location: any) => {
          locationNameMap[String(location._id)] = location.locationName;
        });

        // Create a map of route ID to location names
        const routeLocationNamesMap: { [key: string]: string[] } = {};
        routeData.forEach((route: IRoute) => {
          const locationNames: string[] = [];
          route.locations.forEach((location: ILocation) => {
            const locationName = locationNameMap[String(location.location)];
            if (locationName) {
              locationNames.push(locationName);
            }
          });
          routeLocationNamesMap[String(route._id)] = locationNames;
        });

        setLocations(routeLocationNamesMap);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    }
    fetchShifts();
  }, [date]);

  const AddDays = (e: number) => {
    const newDate = new Date(date);
    if (newDate.getDate() - new Date().getDate() !== 7 || e === -1) {
      newDate.setDate(newDate.getDate() + e);
      setDate(newDate);
    }
  };
    

  const addTimes = () => {
    const divs = [];
    for (let i = 0; i < 24; i+=4) {
      const startTime = new Date(date);
      startTime.setHours(i, 0, 0, 0);
      const endTime = new Date(date);
      endTime.setHours(i + 4, 0, 0, 0);

      let currShifts = shifts.filter((shift) => {
        const shiftDate = new Date(shift.shiftDate);
        const matchesTime = shiftDate.getUTCHours() >= startTime.getHours() && shiftDate.getUTCHours() < endTime.getHours();
        const matchesStatus = activeTab === "open" ? shift.status === "open" : shift.status === "assigned";
        return matchesTime && matchesStatus;
      });
      
      divs.push(
        <div key={i} className='min-h-[5rem]'>
          <DailyShiftBar onOpenSidebar={(shift: Shift, route: IRoute, location_list: string[]) => {
              setSelectedItem({shift, route, shiftDate: new Date(date), location_list});
            }}
            onDeleteShift={handleDeleteShift}
            shift={currShifts}
            routes={routes} 
            locations={locations}
            startTime={startTime} 
            endTime={endTime} />
        </div>
      )
    }
    return divs;
  };

  // Calculate counts for tabs
  const assignedCount = shifts.filter(shift => shift.status === "assigned").length;
  const openCount = shifts.filter(shift => shift.status === "open").length;

  return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1 relative'>
        {/* header location */}
        <DashboardHeader date={date} AddDays={AddDays} />
        {/* main content */}
        <div className='bg-[#ECF2F9] flex flex-col pl-9 pr-9 gap-6 min-h-screen'>
        {selectedItem && 
          <ShiftSidebar
            shiftSidebarInfo={selectedItem}
            onOpenSidebar={() => {
              setSelectedItem(null);
            }}
          />
        }
          <div className='flex justify-between text-[#6C7D93] mt-6'>
            <div className='flex gap-4 items-center'>
              <button className={styles.filterButton}>
                <FilterIcon />
                <span>Sort by</span>
              </button>
            </div>
            <div className='flex min-w-96 border px-5 py-[.6rem] justify-start gap-2 rounded-[2.5rem] bg-white'>
              <FontAwesomeIcon icon={faSearch} className='mt-1' />
              <input className='min-w-96 outline-none' type='search' onChange={(e) => { setSearch(e.target.value) }} placeholder='Search for a shift'></input>
            </div>
          </div>

          <div className='flex mt-6'>
            <button 
              className={`${styles.tabButton} ${activeTab === "assigned" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("assigned")}
            >
              Shifts ({assignedCount})
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === "open" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("open")}
            >
              Open Shifts ({openCount})
            </button>
          </div>
          <div className='flex w-full items-center border-b bg-[#82AEE15E] p-4 rounded-2xl text-[#072B68] font-[700] opacity-50'>
            <div className='min-w-[10.25rem]'>Time</div>
            <div className="w-full grid grid-cols-8">
              <div className='col-span-2'>Volunteer Name</div>
              <div className='col-span-2'>Route Name</div>
              <div className='col-span-2'>Area</div>
              <div className="col-span-2 text-center flex justify-around">
                <span className='text-center md:px-10'>Status</span>
                <FontAwesomeIcon icon={faEllipsis} className='flex-shrink mt-1 min-w-0 invisible' />
              </div>
            </div>
          </div>
          {addTimes()}
        </div>
      </div>
    </div>
  );
}

export default DailyShiftDashboardPage;