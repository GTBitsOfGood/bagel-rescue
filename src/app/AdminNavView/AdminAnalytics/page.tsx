import Sidebar from '@/components/Sidebar';
import react from 'react';

export default function AdminAnalytics() {
  return (
    <div className='flex'>
      <Sidebar/>
      <div className="flex flex-col w-full gap-6 bg-[#F6F9FC]">
        <div className="flex flex-col p-9 justify-start space-y-6 bg-white border-b w-full">
            <h1 className="text-4xl font-bold text-[#072B68]">Analytics</h1>
        </div>
        <div className='flex flex-col bg-[#F6F9FC] w-full h-full'>
            <div className='px-9'>
                <p>Last updated on mm-dd-yy hh:mm:ss</p>
            </div>
            <div className='flex px-9 items-start gap-6 self-stretch'>
                <div className='flex flex-col p-6 justify-between items-start flex-[1_0_0] self-stretch rounded-lg bg-white'>
                    <div>
                        
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}