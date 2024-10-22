import React, { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleLeft, faAngleRight, faPlus } from '@fortawesome/free-solid-svg-icons';

interface DashboardHeaderProps {
    date: Date;
    AddDays: (days: number) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ date, AddDays }) => {
    const debouncedAddDays = useCallback(debounce(AddDays, 300), [AddDays]);


    return (
        <div className='flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE]'>
            <span className='text-[#072B68] mt-2 font-[700] text-4xl'>Dashboard</span>
            <div className='flex gap-6'>
                <div className='flex justify-between gap-4'>
                    <div className='flex border justify-between p-[.8rem] px-4 rounded-xl gap-5'>
                        <button title='adddays' onClick={() => debouncedAddDays(-1)}>
                            <FontAwesomeIcon icon={faAngleLeft} className='mt-1 cursor-pointer' />
                        </button>
                        <span className='font-[700]'>{date.toLocaleDateString("en-us", { month: "long", day: "2-digit", year: "numeric" })}</span>
                        <button title='adddays' onClick={() => debouncedAddDays(1)}>
                            <FontAwesomeIcon icon={faAngleRight} className='mt-1 cursor-pointer' />
                        </button>
                    </div>
                    <div className='flex border justify-between p-[.8rem] px-4 rounded-xl'>
                        <span className='mr-6'>Day</span>
                        <FontAwesomeIcon icon={faAngleDown} className='mt-1' />
                    </div>
                </div>
                <div className='bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem]  px-5 gap-2 rounded-xl'>
                    <FontAwesomeIcon icon={faPlus} className='mr-3' />
                    <span>New Shift</span>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;

function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}