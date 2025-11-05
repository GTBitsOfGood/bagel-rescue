"use client";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useRef } from "react";
import { Shift } from "@/server/db/models/shift";
import { IRoute } from "@/server/db/models/Route";
import ThreeDotModal from "./ThreeDotModal";
import { useRouter } from "next/navigation";

function DailyShiftBar({
  shift,
  routes,
  locations,
  startTime,
  endTime,
  dateKey,
  onOpenSidebar,
  onDeleteShift
}: {
  shift: Shift[];
  routes: {[key: string]: IRoute};
  locations: {[key: string]: string[]};
  startTime: Date;
  endTime: Date;
  dateKey: string;
  onOpenSidebar: (shift: Shift, route: IRoute, location_list: string[]) => void;
  onDeleteShift: (shift: Shift) => void;
}) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const ellipsisRef = useRef<HTMLButtonElement>(null);

  const handleEllipsisClick = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation(); // Prevent triggering the row click
    setSelectedShift(shift);
    
    // Calculate position for the modal
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom - 10
    });
    
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedShift) {
      onDeleteShift(selectedShift);
    }
  };
  
  const handleViewShift = (confirmationFormId: string, e: any) => {
    e.stopPropagation();
    router.push(`/AdminNavView/ViewConfirmationForm?confirmationFormId=${confirmationFormId}`);
  }

  let shiftDate =
    new Date(startTime).toLocaleTimeString("en-us", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " - ";
  const shiftEndDate = new Date(endTime).toLocaleTimeString(
    "en-us",
    { hour: "2-digit", minute: "2-digit" }
  );
  shiftDate = shiftDate + shiftEndDate;
  
  const volunteerdivs = () => {
    const divs = [];
    for (let j = 0; j < shift.length; j++) {
      for (let i = 0; i < shift[j].currSignedUp; i++) {
        const route = routes[shift[j].routeId.toString()] || null;
        const routeName = route ? route.routeName : null;
        const location_list = route ? locations[route._id.toString()] : [];
        const confirmationFormId = shift[j].confirmationForm[dateKey.slice(0, 10)]
        if (i === 0) {
          divs.push(
            <div key={`${startTime.getHours()}-${i}-${j}-first`}
             className="grid grid-cols-8 pl-5 pr-4 py-5 border-[#7D7E82A8] hover:bg-[#ECECEC] border-opacity-65 border-t rounded-[.625rem] items-center"
             onClick={() => onOpenSidebar(shift[j], route, location_list)}>
              <div className="col-span-2">Volunteer Name</div>
              <div className="col-span-2">{routeName}</div>
              <div className="col-span-1">{`Atlanta`}</div>
              <div className="col-span-1">
                {confirmationFormId !== undefined ?
                <button
                  onClick={(e) => handleViewShift(confirmationFormId.toString(), e)}
                  className="flex items-center gap-2 bg-[#E3FCEF] px-4 py-2 rounded-full whitespace-nowrap"
                >
                  <span
                    className=""
                  >
                    View form
                  </span>
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                        <path d="M8.5 2.5H2.5C1.96957 2.5 1.46086 2.71071 1.08579 3.08579C0.710714 3.46086 0.5 3.96957 0.5 4.5V14.5C0.5 15.0304 0.710714 15.5391 1.08579 15.9142C1.46086 16.2893 1.96957 16.5 2.5 16.5H12.5C13.0304 16.5 13.5391 16.2893 13.9142 15.9142C14.2893 15.5391 14.5 15.0304 14.5 14.5V8.5M7.5 9.5L16.5 0.5M16.5 0.5H11.5M16.5 0.5V5.5" stroke="#59431B" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                </button>
                : 
                ""}
              </div>
              <div className="col-span-1 md:col-span-2 text-center flex flex-auto justify-around items-center w-full md:min-w-0 space-x-2">
                <button className="bg-[#D3D8DE] flex-shrink py-2 md:px-7 text-center rounded-[2.75rem] font-[600] opacity-60 text-[#072B68]">{`incomplete`}</button>
                <button
                  ref={ellipsisRef}
                  onClick={(e) => handleEllipsisClick(e, shift[j])}
                  className="flex-shrink mt-1 min-w-0 hover:bg-gray-100 rounded p-1"
                  title="More options"
                  aria-label="More options"
                >
                  <FontAwesomeIcon
                    icon={faEllipsis}
                    className="flex-shrink mt-1 min-w-0"
                  />
                </button>
              </div>
            </div>
          );
        }
      }
    }
    return divs;
  };

  return (
    <>
      <div className="flex w-full items-center">
        <div className="col-span-1 font-[700] text-xl max-w-36 ml-4 text-[#072B68]">
          {shiftDate}
        </div>
        <div className="rounded-[.625rem] w-full bg-white border-x border-b border-[#7D7E82A8] border-opacity-65">
          {volunteerdivs()}
        </div>
      </div>
      
      <ThreeDotModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onDelete={handleDelete}
        position={modalPosition}
      />
    </>
  );
}

export default DailyShiftBar;
