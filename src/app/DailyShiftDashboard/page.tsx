'use client'

import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleLeft, faAngleRight, faArrowUpShortWide, faPlus, faSearch, faSortDesc } from '@fortawesome/free-solid-svg-icons';

function DailyShiftDashboardPage() {
    return (
        <div className='flex flex-col'>
            <div className='flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE]'>
                <span className='text-[#072B68] mt-2 font-[700] text-4xl'>Dashboard</span>
                <div className='flex gap-6'>
                    <div className='flex justify-between gap-4'>
                        <div className='flex border justify-between p-4 rounded-xl gap-5'>
                            <FontAwesomeIcon icon={faAngleLeft} className='mt-1'/>
                            <span>October 3rd, 2024</span>
                            <FontAwesomeIcon icon={faAngleRight} className='mt-1'/>
                        </div>
                        <div className='flex border justify-between p-4 rounded-xl'>
                            <span className='mr-5'>Day</span>
                            <FontAwesomeIcon icon={faAngleDown} className='mt-1'/>
                        </div>
                    </div>
                    <div className='bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-4 gap-2 rounded-xl'>
                        <FontAwesomeIcon icon={faPlus} className='mr-2' />
                         <span>New Shift</span>
                    </div>
                </div>
            </div>
            <div className='bg-[#ECF2F9] flex flex-col pl-9 pr-9 gap-6'>
                <div className='flex justify-between text-[#6C7D93]'>
                    <div className='p-4 rounded-xl gap-2 border bg-white'>
                        <FontAwesomeIcon icon={faArrowUpShortWide}/>
                        <span>Sort by</span>
                    </div>
                    <div className='flex min-w-96 border p-4 justify-start gap-2 rounded-[2.5rem] bg-white'>
                        <FontAwesomeIcon icon={faSearch} className='mt-1'/>
                        <input className='block w-max' type='search' placeholder='Search for a shift'></input>
                    </div>
                </div>
                <div className='flex justify-between'>

                </div>
            </div>
        </div>
    );
}

export default DailyShiftDashboardPage;