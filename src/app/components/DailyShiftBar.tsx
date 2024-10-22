'use client'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Shift } from '@/server/db/models/shift';
import { IRoute } from '@/server/db/models/Route';

function DailyShiftBar({ key, shift, route }: {key: string, shift: Shift, route: IRoute }) {
    const routeName = route ? route.routeName : null;
    let shiftDate = new Date(shift.shiftDate).toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit" }) + " - ";
    const shiftEndDate = new Date(shift.shiftEndDate).toLocaleTimeString("en-us", { hour: "2-digit", minute: "2-digit" });
    shiftDate = shiftDate + shiftEndDate;

    const volunteerdivs = () => {
        const divs = [];
        for (let i = 0; i < shift.currSignedUp; i++) {
            if (i === 0) {
                divs.push(
                    <div className='grid grid-cols-8 pl-5 pr-4 py-5 border-[#7D7E82A8] border-opacity-65 border-t rounded-[.625rem] items-center'>
                        <div className="col-span-2">Volunteer Name</div>
                        <div className="col-span-2">{routeName}</div>
                        <div className="col-span-2">{`Atlanta`}</div>
                        <div className="col-span-1 md:col-span-2 text-center flex flex-auto justify-around items-center w-full md:min-w-0 space-x-2">
                            <button className='bg-[#D3D8DE] flex-shrink py-2 md:px-7 text-center rounded-[2.75rem] font-[600] opacity-60 text-[#072B68]'>{`incomplete`}</button>
                            <FontAwesomeIcon icon={faEllipsis} className='flex-shrink mt-1 min-w-0' />
                        </div>
                    </div>
                )
            }
            divs.push(
                <div className='grid grid-cols-8 pl-5 pr-4 py-5 border-[#7D7E82A8] border-opacity-65 border-t items-center'>
                    <div className="col-span-2">Volunteer Name</div>
                    <div className="col-span-2">{routeName}</div>
                    <div className="col-span-2">{`Atlanta`}</div>
                    <div className="col-span-1 md:col-span-2 text-center flex flex-auto justify-around items-center w-full md:min-w-0 space-x-2">
                        <button className='bg-[#D3D8DE] flex-shrink py-2 md:px-7 text-center rounded-[2.75rem] font-[600] opacity-60 text-[#072B68]'>{`incomplete`}</button>
                        <FontAwesomeIcon icon={faEllipsis} className='flex-shrink mt-1 min-w-0' />
                    </div>
                </div>
            )
        }
        return divs;
    }

    return (
        <div className='flex w-full items-center'>
            <div className="col-span-1 font-[700] text-xl max-w-36 ml-4 text-[#072B68]">{shiftDate}</div>
            <div className='rounded-[.625rem] w-full bg-white border-x border-b border-[#7D7E82A8] border-opacity-65'>
                {volunteerdivs()}
            </div>
        </div>
        
    )
}

export default DailyShiftBar;