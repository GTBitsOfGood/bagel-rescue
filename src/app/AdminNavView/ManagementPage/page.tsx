'use client'

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from '../../../components/AdminSidebar';
import ManagementBar from '../../components/ManagementBar';
import {IUser} from '@/server/db/models/User';

function ManagementPage() {
  const [search, setSearch] = useState<string>('');
  const [volunteers, setVolunteers] = useState<IUser[]>([]);

  useEffect(() => {
    fetchVolunteerData();
  }, [])

  async function fetchVolunteerData() {
    try {
      const response = await fetch('/api/volunteers')
      const data = await response.json();
      setVolunteers(data);
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
      setVolunteers([]);
    }
  }

  function formatStatus(status: string) {
    return status
    .toLowerCase()
    .split('_')
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');   
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1'>
        <ManagementBar />
        <div className='bg-[#ECF2F9] flex flex-col pl-9 pr-9 gap-6 min-h-screen'>
          <div className='flex justify-between text-[#6C7D93] mt-6'>
            <div className='flex min-w-96 border px-5 py-[.6rem] justify-start gap-2 rounded-[2.5rem] bg-white'>
              <FontAwesomeIcon icon={faSearch} className='mt-1' />
              <input 
                className='min-w-96 outline-none' 
                type='search' 
                onChange={(e) => { setSearch(e.target.value) }} 
                placeholder='Search for volunteer'
              />
            </div>
            <div className='flex flex-row gap-4 justify-center items-center text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]'>
              <div className='mr-[-0.4rem]'>Sorted: </div>
              <button className='px-5 py-[.6rem] rounded-lg space-x-2 border bg-white'>
                <span>Alphabetically</span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              <button className='px-5 py-[.6rem] rounded-lg space-x-2 border bg-white'>
                <span>Filter</span>
              </button>
            </div>
          </div>
          {/* Content will go here */}
          <div className='w-full h-full flex flex-col gap-4'>
            <div className='w-full flex flex-row items-center py-4 px-[3.5rem] gap-x-12 bg-blue-200 rounded-lg text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]'>
              <p className='w-[10rem]'>Name</p>
              <p className='w-[17rem]'>Locations</p>
              <p className='w-[14.5rem]'>Status</p>
              <p className='w-[7rem]'>Shifts</p>
              <p className='w-[8rem]'>Volunteer Time</p>
            </div>
            <div className='w-full h-full flex flex-col gap-4'>
              {volunteers.map((volunteer, index) => (
                <button key={index} className='w-full flex flex-row justify-start items-center py-4 px-[3.5rem] gap-x-12 border-2 rounded-lg border-[var(--Bagel-Rescue-Light-Grey-2,#d3d8de)] bg-[var(--Bagel-Rescue-Light-Blue-2,#ecf2f9)] text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]'>
                  <p className='w-[10rem] flex justify-start items-center'>{volunteer.firstName} {volunteer.lastName}</p>
                  <div className='w-[17rem] flex flex-row justify-start items-center gap-1'>
                    {volunteer?.locations?.slice(0, 3).map((location, i) => (
                      <div key={i} className='text-sm bg-gray-200 rounded-lg px-2 py-[0.2rem]'>
                        {location}
                      </div>
                    ))}
                    {(volunteer.locations) && volunteer.locations.length > 3 && (
                      <div className='text-sm bg-gray-200 rounded-lg px-2 py-[0.2rem]'>
                        ...
                      </div>
                    )}
                  </div>
                  <div className='w-[14.5rem]'>
                    <div className={`w-[9rem] flex justify-center items-center text-sm rounded-lg px-2 py-[0.2rem] 
                      ${volunteer.status === 'ACTIVE' 
                        ? 'bg-[#C8FFE3] text-green-900' 
                        : volunteer.status === 'SEND_INVITE' 
                        ? 'bg-[#FFDAC8] text-[#501B00]'
                        : volunteer.status === 'INVITE_SENT'
                        ? 'bg-[#FBFFC8] text-[#3D4200]'
                        : ''
                      }`}>
                        {formatStatus(volunteer.status ?? "")}
                    </div>
                  </div>
                  {/* temporary parse for required shift data */}
                  <p className='w-[7rem] flex justify-start items-center'>
                    {volunteer.monthlyShifts && Object.keys(volunteer.monthlyShifts).length > 0 
                      ? volunteer.monthlyShifts[Object.keys(volunteer.monthlyShifts)[Object.keys(volunteer.monthlyShifts).length - 1]].totalShifts 
                      : 0}
                  </p>
                  <p className='w-[8rem] flex justify-start items-center'>
                    {volunteer.monthlyShifts && Object.keys(volunteer.monthlyShifts).length > 0 
                      ? `${volunteer.monthlyShifts[Object.keys(volunteer.monthlyShifts)[Object.keys(volunteer.monthlyShifts).length - 1]].shiftTime} hours`
                      : '0 hours'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagementPage;
