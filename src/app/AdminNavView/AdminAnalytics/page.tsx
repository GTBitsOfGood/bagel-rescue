'use client'
import AdminSidebar from '@/components/AdminSidebar';
import Spinner from '@/components/Spinner';
import { getAdminAnalytics } from '@/server/db/actions/adminAnalytics';
import { handleAuthError } from '@/lib/authErrorHandler';
import { redirect, useRouter } from 'next/navigation';
import react, { useEffect, useState } from 'react';

export default function AdminAnalytics() {
  const router = useRouter();
  const [timeView, setTimeView] = useState<'monthly' | 'yearly'>('monthly');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  type ShiftDummy = {
    routeName: string;
    status: string;
    duration: number;
    shiftDate: string;
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminAnalytics();
        if (!response) {
          console.error('Failed to fetch admin analytics data');
          return;
        }

      const data = JSON.parse(response || "[]");

      if (!data) {
        console.error('No data found for admin analytics');
        return;
      }
      setAnalyticsData(data); 
      } catch (error) {
        if (handleAuthError(error, router, true)) {
          return; // Auth error handled, user redirected
        }
        console.error('Error fetching admin analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }
  , []);
  const viewData = {
    monthly: {
      periodLabel: 'This Month',
      averageLabel: 'Monthly Average',
      totalShifts:   analyticsData ? analyticsData.shiftsThisMonth : 'loading..', 
      averageShifts: analyticsData ? Math.round(analyticsData.monthlyShiftAverage) : 'loading...',
      totalDuration: analyticsData ? `${analyticsData.totalShiftDurationThisMonth /60} hr  ${analyticsData.totalShiftDurationThisMonth % 60} min` : 'loading...', 
      averageDuration: analyticsData ? `${Math.floor((analyticsData.averageShiftDurationThisMonth || 0) / 60)} hr ${Math.round((analyticsData.averageShiftDurationThisMonth || 0) % 60)} min` : 'loading...'
    },
    yearly: {
      periodLabel: 'This Year',
      averageLabel: 'Yearly Average',
      totalShifts: analyticsData ? analyticsData.shiftsThisYear : 'loading..',
      averageShifts: analyticsData ? Math.round(analyticsData.yearlyShiftsAverage) : 'loading...', 
      totalDuration: analyticsData ? `${Math.floor((analyticsData.totalShiftDurationThisYear || 0) / 60)} hr ${Math.round((analyticsData.totalShiftDurationThisYear || 0) % 60)} min` : 'loading...',
      averageDuration: analyticsData ? `${Math.floor((analyticsData.averageShiftDurationThisYear || 0) / 60)} hr ${Math.round((analyticsData.averageShiftDurationThisYear || 0) % 60)} min` : 'loading...'
    }
    
  };

  const volunteerData = {
    totalVolunteers: analyticsData ? analyticsData.totalVolunteers : 'loading...',
    activeVolunteers: analyticsData ? analyticsData.activeVolunteers : 'loading...',
    numberOfNewVolunteers: analyticsData ? analyticsData.numberOfNewVolunteers : 'loading...',
    newVolunteers: analyticsData ? analyticsData.newVolunteers : [],
    volunteersWithMultipleShifts: analyticsData ? analyticsData.volunteersWithMultipleShifts : [],
    lastUpdatedAt: analyticsData ? analyticsData.lastUpdatedAt : null
  }


  const statusColors: {[key: string]: string} = {
    'Complete': 'bg-[var(--Green-Green-100,#E3FCEF)] text-[var(--Green-Green-900,#084C29)]',
    'Incomplete': 'bg-[var(--Light-Gray-300,#F2F2F2)] text-gray-700',
    'Late': 'bg-[var(--Orange-Orange-100,#FEBF98)] text-[#622500]',
    'Sub Request': 'bg-[#FFE3B3] text-[var(--Yellow-Yellow-900,#59431B)]'
  };
  
  const overViewData = viewData[timeView];
  return (
    <div className='flex w-full min-h-screen bg-[#F6F9FC]'>
      <AdminSidebar/>
      <div className="flex flex-col w-full bg-[#F6F9FC]">
        <div className="flex flex-col p-9 justify-start space-y-6 bg-white border-b">
            <h1 className="text-4xl font-bold text-[#072B68]">Analytics</h1>
        </div>
        <div className='flex flex-col bg-[#F6F9FC] gap-6 w-full pb-9'>
            <div className='px-9 pt-6'>
                
                <p>{loading || !volunteerData.lastUpdatedAt 
                    ? "loading..." 
                    : `Last updated on ${new Date(volunteerData.lastUpdatedAt).toLocaleDateString('en-US', {
                        month: 'numeric', 
                        day: 'numeric',
                        year: '2-digit'
                      }).replace(/\//g, '-')} ${new Date(volunteerData.lastUpdatedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}`
                  }</p>
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
                      {!analyticsData ? <Spinner/> : <div className='flex flex-col w-full justify-between items-center'>
                      <div className='grid grid-cols-[2fr_1fr_1fr_1fr] w-full p-[0.625rem]'>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Status</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Time</div>
                        <div className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Date</div>
                      </div>
                      <div className='w-full rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)]'>
                        {!analyticsData ? <Spinner/> : analyticsData?.recentShifts.map((shift: ShiftDummy, index: number) => {
                        if (!shift.routeName) {
                          return (
                            <div key={index} className="grid grid-cols-[2fr_1fr_1fr_1fr] min-h-11  items-center p-[0.525rem] border-b last:border-b-0">  
                            </div>
                          )
                        }
                        return   (
                                  <div 
                                    key={index} 
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr] min-h-10  items-center p-[0.525rem] border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:border-b-0"
                                  >
                                    <div className="text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {shift.routeName}
                                    </div>

                                    <div>
                                      <div className='flex justify-start text-center'>
                                        <span className={`px-2 w-24 py-[.30rem] rounded-[2.75rem] text-xs font-medium ${statusColors[shift.status.charAt(0).toUpperCase()+shift.status.slice(1).toLowerCase()]}`}>
                                          {`${shift.status.charAt(0).toUpperCase()}${shift.status.slice(1).toLowerCase()}` }
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {`${Math.floor(shift.duration / 60)} hr ${shift.duration % 60} min`}
                                    </div>

                                    <div className="flex justify-between text-base leading-5 font-normal text-[var(--Bagel-Rescue-Dark-Blue,#072B68)]">
                                      {`${new Date(shift.shiftDate).getMonth() + 1}-${new Date(shift.shiftDate).getDate()}-${new Date(shift.shiftDate).getFullYear()}`}
                                      <button type='button' title="More options">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M13.5 12C13.5 12.2967 13.412 12.5867 13.2472 12.8334C13.0824 13.08 12.8481 13.2723 12.574 13.3858C12.2999 13.4994 11.9983 13.5291 11.7074 13.4712C11.4164 13.4133 11.1491 13.2704 10.9393 13.0607C10.7296 12.8509 10.5867 12.5836 10.5288 12.2926C10.4709 12.0017 10.5006 11.7001 10.6142 11.426C10.7277 11.1519 10.92 10.9176 11.1666 10.7528C11.4133 10.588 11.7033 10.5 12 10.5C12.3978 10.5 12.7794 10.658 13.0607 10.9393C13.342 11.2206 13.5 11.6022 13.5 12ZM5.625 10.5C5.32833 10.5 5.03832 10.588 4.79165 10.7528C4.54497 10.9176 4.35271 11.1519 4.23918 11.426C4.12565 11.7001 4.09594 12.0017 4.15382 12.2926C4.2117 12.5836 4.35456 12.8509 4.56434 13.0607C4.77412 13.2704 5.04139 13.4133 5.33237 13.4712C5.62334 13.5291 5.92494 13.4994 6.19903 13.3858C6.47311 13.2723 6.70738 13.08 6.87221 12.8334C7.03703 12.5867 7.125 12.2967 7.125 12C7.125 11.6022 6.96697 11.2206 6.68566 10.9393C6.40436 10.658 6.02283 10.5 5.625 10.5ZM18.375 10.5C18.0783 10.5 17.7883 10.588 17.5416 10.7528C17.295 10.9176 17.1027 11.1519 16.9892 11.426C16.8757 11.7001 16.8459 12.0017 16.9038 12.2926C16.9617 12.5836 17.1046 12.8509 17.3143 13.0607C17.5241 13.2704 17.7914 13.4133 18.0824 13.4712C18.3733 13.5291 18.6749 13.4994 18.949 13.3858C19.2231 13.2723 19.4574 13.08 19.6222 12.8334C19.787 12.5867 19.875 12.2967 19.875 12C19.875 11.6022 19.717 11.2206 19.4357 10.9393C19.1544 10.658 18.7728 10.5 18.375 10.5Z" fill="#072B68"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                        )})}
                        {Array.from({ length: Math.max(0, 10 - (analyticsData?.recentShifts?.length || 0)) }).map((_, index) => (
                            <div 
                              key={`empty-shift-${index}`} 
                              className="grid grid-cols-[2fr_1fr_1fr_1fr] min-h-10 items-center p-[0.525rem] border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:border-b-0"
                            >
                              <div className="text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5">&nbsp;</div>
                              <div>&nbsp;</div>
                              <div className="text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5">&nbsp;</div>
                              <div className="text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5">&nbsp;</div>
                            </div>
                          ))}
                        </div>
                      </div> }
                      <div className='flex w-full justify-end items-center '>
                        <button onClick={() => {router.push('/AdminNavView/DailyShiftDashboard')}} type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)] hover:bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                          <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-medium'>Show More</p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
            </div>
            <div className='flex px-9 items-start gap-6 self-stretch w-full h-full'>
              <div className='flex max-w-[17.5rem] w-full bg-white p-6 flex-col items-start gap-6 rounded-lg'>
                <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] flex-shrink-0 self-stretch font-bold text-2xl'>Volunteer Engagement</h1>
                <div className='flex flex-col items-start gap-2 self-stretch'>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>Total Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{loading ? <div>loading...</div> : volunteerData.totalVolunteers}</h2>
                  </div>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>Active Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{loading ? <div>loading...</div> : volunteerData.activeVolunteers}</h2>
                  </div>
                  <div className='flex p-4 flex-col justify-center items-center gap-1 self-stretch rounded-lg border-2 border-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] leading-5'>New Volunteers</p>
                    <h2 className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>{loading ? <div>loading...</div> : volunteerData.numberOfNewVolunteers}</h2>
                    <sub className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-4'>&#40;{`since ${new Date(volunteerData.lastUpdatedAt).toLocaleDateString('en-US', {
                        month: 'numeric', 
                        day: 'numeric',
                        year: '2-digit',
                      })}`}&#41;</sub>
                  </div>
                </div>
              </div>
              <div className='flex bg-white h-full w-full p-6 justify-between items-center rounded-lg'>
                <div className='flex flex-col items-start justify-between h-full w-full'>
                  <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>New Volunteers</h1>
                  {!analyticsData ? <Spinner/> : <div className='w-full'><div className='flex flex-col items-start w-full'>
                    <div className='flex p-[0.625rem] justify-between items-center self-stretch'>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</p>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Date Joined</p>
                    </div>
                    <div className='flex flex-col w-full items-start self-stretch rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:border-b-0 '>
                      { loading ? (
                        <Spinner/>
                          ) : (
                                volunteerData.newVolunteers.map((volunteer: {firstName: string, lastName:string, createdAt: Date}, index: number) => (

                                  <div 
                                    key={index} 
                                    className='flex h-10 p-[0.625rem] pr-[2.17rem] w-full justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:rounded-b-lg'
                                  >
                                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>{`${volunteer.firstName}  ${volunteer.lastName}`}</p>
                                   
                                    <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>{new Date(volunteer.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}</p>
                                  </div>
                                ))
                            )}
                            {Array.from({ length: Math.max(0, 5 - volunteerData.newVolunteers.length) }).map((_, index) => (
                              <div 
                                key={`empty-${index}`} 
                                className='flex h-10 p-[0.625rem] pr-[2.17rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:rounded-b-lg'
                              >
                                <p className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5'>&nbsp;</p>
                                <p className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5'>&nbsp;</p>
                              </div>
                            ))}
                        
                    </div>
                  </div></div>}
                  <div className='flex w-full justify-end items-center flex-shrink-0'>
                      <button type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)] hover:bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-medium'>Show More</p>
                      </button>
                  </div>
                </div>
              </div>
              <div className='flex bg-white h-full w-full p-6 justify-between items-center rounded-lg'>
                <div className='flex flex-col items-start justify-between h-full w-full'>
                  <h1 className='h-16 text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold text-2xl'>Multiple Shifts Volunteers</h1>
                  {!analyticsData ? <Spinner/> :<div className='flex flex-col items-start w-full'>
                    <div className='flex p-[0.625rem] justify-between items-center self-stretch'>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'>Name</p>
                      <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-bold leading-5'># of Shifts</p>
                    </div>
                    
                              
                    <div className='flex flex-col items-start self-stretch rounded-lg border border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:border-b-0'>
                    { loading ? (
                      <div className='flex h-10 p-[0.625rem] justify-center items-center self-stretch last:border-b-0'>
                        <p>Loading...</p>
                        </div>
                        ): ( 
                            volunteerData.volunteersWithMultipleShifts.map((volunteer: any, index: number) => (
                              <div 
                                key={index} 
                                className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:rounded-b-lg'
                              >
                                <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>{`${volunteer.firstName} ${volunteer.lastName}`}</p>
                                <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-normal leading-5'>{volunteer.shiftsCompleted.length}</p>
                              </div>
                            ))
                          )}

              
                        {Array.from({ length: Math.max(0, 5 - volunteerData.volunteersWithMultipleShifts.length) }).map((_, index) => (
                          <div 
                            key={`empty-${index}`} 
                            className='flex h-10 p-[0.625rem] justify-between items-center self-stretch border-b border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] last:rounded-b-lg'
                          >
                            <p className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5'>&nbsp;</p>
                            <p className='text-[var(--Bagel-Rescue-Text-Light,#8496B4)] font-normal leading-5'>&nbsp;</p>
                          </div>
                        ))}
                    </div>
                  </div>}
                  <div className='flex w-full justify-end items-center flex-shrink-0'>
                      <button type='button' className='flex py-2 px-3 gap-[0.625rem] items-center border justify-center border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] rounded-[var(--8,0.5rem)] hover:bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]'>
                        <p className='text-[var(--Bagel-Rescue-Dark-Blue,#072B68)] font-medium'>Show More</p>
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