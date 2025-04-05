'use client'

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
import AdminSidebar from '../../../components/AdminSidebar';
import ManagementBar from '../../components/ManagementBar';

function ManagementPage() {
  const [search, setSearch] = useState<string>('');

  return (
    <div className="flex">
      <AdminSidebar />
      <div className='flex flex-col flex-1'>
        <ManagementBar />
        <div className='bg-[#ECF2F9] flex flex-col pl-9 pr-9 gap-6 min-h-screen'>
          <div className='flex justify-between text-[#6C7D93] mt-6'>
            <div className='px-5 py-[.6rem] rounded-xl space-x-2 border bg-white'>
              <FontAwesomeIcon icon={faArrowUpShortWide} />
              <span>Sort by</span>
            </div>
            <div className='flex min-w-96 border px-5 py-[.6rem] justify-start gap-2 rounded-[2.5rem] bg-white'>
              <FontAwesomeIcon icon={faSearch} className='mt-1' />
              <input 
                className='min-w-96 outline-none' 
                type='search' 
                onChange={(e) => { setSearch(e.target.value) }} 
                placeholder='Search for volunteers'
              />
            </div>
          </div>
          {/* Content will go here */}
        </div>
      </div>
    </div>
  );
}

export default ManagementPage;
