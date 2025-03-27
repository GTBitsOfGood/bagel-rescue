'use client'
import Sidebar from '@/components/Sidebar';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import react, { useState } from 'react';
import { FaEllipsis } from 'react-icons/fa6';

export default function AdminAnalytics() {
  const [timeView, setTimeView] = useState<'monthly' | 'yearly'>('monthly');
  const router = useRouter();

  type ShiftDummy = {
    name: string;
    status: 'Complete' | 'Incomplete' | 'Late' | 'Sub Request';
    time: string;
    date: string;
  };

  const viewData = {
    monthly: {
      periodLabel: 'This Month',
      averageLabel: 'Monthly Average',
      totalShifts: '20',
      averageShifts: '20.5',
      totalDuration: '24 hr 55 min',
      averageDuration: '24 hr 55 min'
    },
    yearly: {
      periodLabel: 'This Year',
      averageLabel: 'Yearly Average',
      totalShifts: '240',
      averageShifts: '245',
      totalDuration: '298 hr 30 min',
      averageDuration: '299 hr 15 min'
    }
  };

  const shiftsData: ShiftDummy[] = [
    {
      name: "Henri's Brookhaven",
      status: 'Complete',
      time: '24 min',
      date: '01-16-25'
    },
    {
      name: "Seasame Street",
      status: 'Incomplete',
      time: '1 hr 55 min',
      date: '01-18-25'
    },
    {
      name: "123 Cork Lane",
      status: 'Late',
      time: '1 hr 55 min',
      date: '02-16-25'
    },
    {
      name: "Bakery",
      status: 'Sub Request',
      time: '1 hr 55 min',
      date: '04-16-25'
    },
    {
      name: "Food Place",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '01-16-24'
    },
    {
      name: "Another Food Place",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '11-16-24'
    },
    {
      name: "Buckhead",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '12-16-24'
    },
    {
      name: "Atlanta",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '03-16-25'
    },
    {
      name: "Tech",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '01-10-25'
    },
    {
      name: "",
      status: 'Complete',
      time: '1 hr 55 min',
      date: '02-16-25'
    },
    
  ];

  const statusColors = {
    'Complete': 'bg-green-100 text-[var(--Green-Green-900,#084C29)]',
    'Incomplete': 'bg-gray-100 text-gray-800',
    'Late': 'bg-orange-100 text-orange-800',
    'Sub Request': 'bg-yellow-100 text-yellow-800'
  };
  
  const overViewData = viewData[timeView];
  return (
    <div className='flex w-full min-h-screen bg-[#F6F9FC]'>
      <Sidebar/>
      <div className="flex flex-col w-full bg-[#F6F9FC]">
        <div className="flex flex-col p-9 justify-start space-y-6 bg-white border-b">
            <h1 className="text-4xl font-bold text-[#072B68]">Analytics</h1>
        </div>
        <div className='flex flex-col bg-[#F6F9FC] gap-6 w-full pb-9'>
            <div className='px-9 pt-6'>
                
                <p>Last updated on 3-27-25 12:45:00</p>
            </div>
            <div className='flex px-9 items-start gap-6 self-stretch'>
                <div className='max-w-[26.5rem] w-full flex flex-col p-6 gap-7 items-start self-stretch rounded-lg bg-white'>
                    <div className='flex max-w-[23.5rem] max-h-8 w-full h-full justify-between items-center'>
                        <h1 className='font-bold text-2xl w-full max-w-[7.1875rem] flex-shrink-0 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]'>Overview</h1>
                        <div className="flex items-center bg-white rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] max-h-8 h-full">
                          <button 
                          type='button' 
                          title='Monthly' 
                          className={`flex max-w-[5.125rem] rounded-lg max-h-8 w-full h-full p-[0.625rem] gap-[0.625rem] text-center justify-center items-center ${timeView === 'monthly' ? 'bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]' : ''}`}
                          onClick={() => setTimeView('monthly')}
                          >  
                          <p className={timeView === 'monthly' ? 'text-[var(--Bagel-Rescue-Primary-Blue,#0F7AFF)]' : 'text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]'}>Monthly</p>
                          </button>
                          <button 
                          type='button' 
                          className={`flex w-[5.125rem] rounded-lg max-h-8 h-full p-[0.625rem] gap-[0.625rem] text-center justify-center items-center ${timeView === 'yearly' ? 'bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]' : ''}`}
                          onClick={() => setTimeView('yearly')}
                          >
                          <p className={timeView === 'yearly' ? 'text-[var(--Bagel-Rescue-Primary-Blue,#0F7AFF)]' : 'text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]'}>Yearly</p>
                          </button>
                        </div>
                    </div>
                    <div className='flex flex-col items-start gap-2 self-stretch'>
                          <p className='self-stretch text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold '>Total Shifts</p>
                          <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-2xl border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                            <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>{overViewData.periodLabel}</p>
                            <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{overViewData.totalShifts}</h2>
                          </div>
                          <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-2xl border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                            <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>{overViewData.averageLabel}</p>
                            <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{overViewData.averageShifts}</h2>
                          </div>
                    </div>
                    <div className='flex flex-col items-start gap-2 self-stretch'>
                          <p className='self-stretch text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold '>Total Shift Duration</p>
                          <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-2xl border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                            <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>{overViewData.periodLabel}</p>
                            <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{overViewData.totalDuration}</h2>
                          </div>
                          <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-2xl border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                            <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>{overViewData.averageLabel}</p>
                            <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{overViewData.averageDuration}</h2>
                          </div>
                    </div>
                    <div className='flex h-[2.75rem] justify-end items-center'>
                    
                    </div>
                </div>
                <div className='w-full bg-white h-full'>
                  <div className='p-6 w-full h-full flex'>
                    <div className='flex h-full w-full gap-3 flex-col justify-between items-start'>
                      <h1 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>Recent Shifts</h1> 
                      <div className='flex flex-col w-full justify-between items-center'>
                      <div className='grid grid-cols-[2fr_1fr_1fr_1fr] w-full p-[0.625rem]'>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Status</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Time</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Date</div>
                      </div>
                      <div className='w-full rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        {shiftsData.map((shift, index) => {
                        if (!shift.name) {
                          return (
                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr] min-h-10  items-center p-[0.525rem] border-b last:border-b-0 hover:bg-gray-50 transition-colors">  
                            </div>
                          )
                        }
                        return   (
                                  <div 
                                    key={index} 
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr] min-h-10  items-center p-[0.525rem] border-b last:border-b-0 hover:bg-gray-50"
                                  >
                                    <div className="text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {shift.name}
                                    </div>

                                    <div>
                                      <div className='flex justify-start text-center'>
                                        <span className={`px-2 w-24 py-[.30rem] rounded-[2.75rem] text-xs font-medium ${statusColors[shift.status]}`}>
                                          {shift.status}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {shift.time}
                                    </div>

                                    <div className="flex justify-between text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {shift.date}
                                      <button type='button' title="More options">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M13.5 12C13.5 12.2967 13.412 12.5867 13.2472 12.8334C13.0824 13.08 12.8481 13.2723 12.574 13.3858C12.2999 13.4994 11.9983 13.5291 11.7074 13.4712C11.4164 13.4133 11.1491 13.2704 10.9393 13.0607C10.7296 12.8509 10.5867 12.5836 10.5288 12.2926C10.4709 12.0017 10.5006 11.7001 10.6142 11.426C10.7277 11.1519 10.92 10.9176 11.1666 10.7528C11.4133 10.588 11.7033 10.5 12 10.5C12.3978 10.5 12.7794 10.658 13.0607 10.9393C13.342 11.2206 13.5 11.6022 13.5 12ZM5.625 10.5C5.32833 10.5 5.03832 10.588 4.79165 10.7528C4.54497 10.9176 4.35271 11.1519 4.23918 11.426C4.12565 11.7001 4.09594 12.0017 4.15382 12.2926C4.2117 12.5836 4.35456 12.8509 4.56434 13.0607C4.77412 13.2704 5.04139 13.4133 5.33237 13.4712C5.62334 13.5291 5.92494 13.4994 6.19903 13.3858C6.47311 13.2723 6.70738 13.08 6.87221 12.8334C7.03703 12.5867 7.125 12.2967 7.125 12C7.125 11.6022 6.96697 11.2206 6.68566 10.9393C6.40436 10.658 6.02283 10.5 5.625 10.5ZM18.375 10.5C18.0783 10.5 17.7883 10.588 17.5416 10.7528C17.295 10.9176 17.1027 11.1519 16.9892 11.426C16.8757 11.7001 16.8459 12.0017 16.9038 12.2926C16.9617 12.5836 17.1046 12.8509 17.3143 13.0607C17.5241 13.2704 17.7914 13.4133 18.0824 13.4712C18.3733 13.5291 18.6749 13.4994 18.949 13.3858C19.2231 13.2723 19.4574 13.08 19.6222 12.8334C19.787 12.5867 19.875 12.2967 19.875 12C19.875 11.6022 19.717 11.2206 19.4357 10.9393C19.1544 10.658 18.7728 10.5 18.375 10.5Z" fill="#072B68"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                      )})}
                      </div>
                      </div> 
                      <div className='flex w-full justify-end items-center '>
                        <button onClick={() => {router.push('/AdminNavView/DailyShiftDashboard')}} type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)]'>
                          <p>Show More</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
            </div>
            <div className='flex px-9 items-start gap-6 self-stretch w-full h-full'>
              <div className='flex max-w-[19.5rem] w-full bg-white p-6 flex-col items-start gap-6 rounded-lg'>
                <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] flex-shrink-0 self-stretch font-bold text-2xl'>Volunteer Engagement</h1>
                <div className='flex flex-col items-start gap-2 self-stretch'>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>Total Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>200</h2>
                  </div>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>Active Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>200</h2>
                  </div>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>New Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>15</h2>
                    <sub className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-4'>&#40;since 03/27/25&#41;</sub>
                  </div>
                </div>
              </div>
              <div className='flex bg-white h-full w-full p-6 justify-between items-center rounded-lg'>
                <div className='flex flex-col items-start justify-between h-full w-full'>
                  <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>New Volunteers</h1>
                  <div className='flex flex-col items-start w-full'>
                    <div className='flex p-[0.625rem] justify-between items-center self-stretch'>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</p>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Date Joined</p>
                    </div>
                    <div className='flex flex-col items-start self-stretch rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>John Doe</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>11-10-24</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Jane Doe</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>12-21-24</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Bruno Mars</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>01-21-25</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Andy Brown</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>02-22-25</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch'>
                        
                      </div>
                    </div>
                  </div>
                  <div className='flex w-full justify-end items-center flex-shrink-0'>
                      <button type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)]'>
                        <p>Show More</p>
                      </button>
                  </div>
                </div>
              </div>
              <div className='flex bg-white h-full w-full p-6 justify-between items-center rounded-lg'>
                <div className='flex flex-col items-start justify-between h-full w-full'>
                  <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>Multiple Shifts Volunteers</h1>
                  <div className='flex flex-col items-start w-full'>
                    <div className='flex p-[0.625rem] justify-between items-center self-stretch'>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</p>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'># of Shifts</p>
                    </div>
                    <div className='flex flex-col items-start self-stretch rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>John Doe</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>3</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Jane Doe</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>2</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Bruno Mars</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>2</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>Andy Brown</p>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>2</p>
                      </div>
                      <div className='flex h-10 p-[0.625rem] justify-between items-center self-stretch'>
                        
                      </div>
                    </div>
                  </div>
                  <div className='flex w-full justify-end items-center flex-shrink-0'>
                      <button type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)]'>
                        <p>Show More</p>
                      </button>
                  </div>
                </div>
              </div>
            </div>
            
        </div>
      </div>
    </div>
  );
}