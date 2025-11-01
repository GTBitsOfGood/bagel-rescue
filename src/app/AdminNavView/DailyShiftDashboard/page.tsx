'use client'

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleLeft, faAngleRight, faArrowUpShortWide, faEllipsis, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Shift } from '@/server/db/models/shift';
import { getAllShifts } from '@/server/db/actions/shift';
import { IRoute } from '@/server/db/models/Route';
import { getAllRoutesbyIds, getRoute } from '@/server/db/actions/Route';
import WeeklyShiftBar from '../../components/DailyShiftBar';
import DashboardHeader from '../../components/DailyDashboard';
import DailyShiftBar from '../../components/DailyShiftBar';
import AdminSidebar from '../../../components/AdminSidebar';
import ShiftSidebar, { ShiftSidebarInfo } from '@/app/components/ShiftSidebar';
import { Location } from '@/server/db/models/location';
import { ILocation } from '@/server/db/models/Route';
import { getAllLocationsById } from '@/server/db/actions/location';

function DailyShiftDashboardPage() {

  const [search, setSearch] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [routes, setRoutes] = useState<{ [key: string]: IRoute }>({});
  const [locations, setLocations] = useState<{ [key: string]: string[] }>({});
  const [selectedItem, setSelectedItem] = useState<ShiftSidebarInfo | null>(null);

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

      console.log("Shifts fetched:", data);

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
        // Check if shift occurs on the selected date
        let occursOnDate = false;
        
        // Handle recurring shifts (check if date falls on one of the recurring days)
        if (shift.recurrenceDates && shift.recurrenceDates.length > 0 && shift.shiftStartDate && shift.shiftEndDate) {
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          const shiftStart = new Date(shift.shiftStartDate);
          shiftStart.setHours(0, 0, 0, 0);
          const shiftEnd = new Date(shift.shiftEndDate);
          shiftEnd.setHours(0, 0, 0, 0);
          
          // Check if date is within range
          if (selectedDate >= shiftStart && selectedDate <= shiftEnd) {
            // Get day of week for selected date (0 = Sunday, 1 = Monday, etc.)
            const selectedDayOfWeek = selectedDate.getDay();
            const dayToAbbr: { [key: number]: string } = { 0: "su", 1: "mo", 2: "tu", 3: "we", 4: "th", 5: "fr", 6: "sa" };
            const selectedDayAbbr = dayToAbbr[selectedDayOfWeek];
            
            // Check if this day is in recurrenceDates
            occursOnDate = shift.recurrenceDates.includes(selectedDayAbbr);
          }
        } 
        // Handle non-recurring shifts - check shiftStartDate or shiftDate (for backward compatibility)
        else {
          const shiftDate = shift.shiftStartDate ? new Date(shift.shiftStartDate) : (shift.shiftDate ? new Date(shift.shiftDate) : null);
          if (shiftDate) {
            shiftDate.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);
            occursOnDate = shiftDate.getTime() === selectedDate.getTime();
          }
        }
        
        if (!occursOnDate) return false;
        
        // Check if shift time falls within this time block
        const shiftStartTime = shift.shiftStartTime ? new Date(shift.shiftStartTime) : 
                              (shift.shiftStartDate ? new Date(shift.shiftStartDate) : 
                              (shift.shiftDate ? new Date(shift.shiftDate) : null));
        if (!shiftStartTime) return false;
        
        const shiftHour = shiftStartTime.getHours();
        return shiftHour >= i && shiftHour < i + 4;
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
            <div className='px-5 py-[.6rem] rounded-xl space-x-2'>
              {/* <FontAwesomeIcon icon={faArrowUpShortWide} />
              <span>Sort by</span> */}
            </div>
            <div className='flex min-w-96 border px-5 py-[.6rem] justify-start gap-2 rounded-[2.5rem] bg-white'>
              <FontAwesomeIcon icon={faSearch} className='mt-1' />
              <input className='min-w-96 outline-none' type='search' onChange={(e) => { setSearch(e.target.value) }} placeholder='Search for a shift'></input>
            </div>
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