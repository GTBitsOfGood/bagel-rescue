"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Shift } from "@/server/db/models/shift";
import { updateComment } from "@/server/db/actions/shift";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faCommentDots, 
  faCheck, 
  faTrashCan, 
  faPenClip
} from "@fortawesome/free-solid-svg-icons";
import { DailyShiftSidebarInfo } from "../AdminNavView/DailyShiftDashboard/page";
interface ShiftSidebarProps {
    shiftSidebarInfo: DailyShiftSidebarInfo;
    onOpenSidebar: () => void;
}
import "./stylesheet.css";

const getDays = (recurrenceRule: string): string => {
  const dayMap: { [key: string]: string } = {
    'MO': 'Monday',
    'TU': 'Tuesday',
    'WE': 'Wednesday',
    'TH': 'Thursday',
    'FR': 'Friday',
    'SA': 'Saturday',
    'SU': 'Sunday'
  };

  try {
    // Parse the recurrence rule string
    const parts = recurrenceRule.split(';');
    const byDayPart = parts.find(part => part.startsWith('BYDAY='));
    
    if (byDayPart) {
      const dayCodes = byDayPart.substring(6).split(','); // Remove "BYDAY=" and split by comma
      const dayNames = dayCodes.map(code => dayMap[code] || code);
      return dayNames.join(', ');
    }
    
    return "--"; // Return original if no BYDAY found
  } catch (error) {
    return "--"; // Return original if parsing fails
  }
}

const ShiftSidebar: React.FC<ShiftSidebarProps> = ({shiftSidebarInfo, onOpenSidebar}) => {

  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(''); 
  const [draft, setDraft] = useState(''); 
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // used to load last comment
    if (!hasLoaded) {
      const comments = shiftSidebarInfo.shift.comments;
      if (comments && typeof comments === 'object' && Object.keys(comments).length > 0) {
        const dates = Object.keys(comments).sort().reverse();
        const mostRecentComment = comments[dates[0]];
        setComment(mostRecentComment);
        setDraft(mostRecentComment);
      }
      setHasLoaded(true);
    }
  }, [shiftSidebarInfo.shift._id, hasLoaded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [shiftSidebarInfo.shift._id]);

  return (
    <div className="main-sidebar">
        <div className="sidebar-header">
            <div 
              className="arrow-box flex items-center justify-center hover:bg-gray-200 transition" 
              onClick={onOpenSidebar}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-11" viewBox="0 0 32 44" fill="none">
                  <path d="M17.7075 22.7076L7.70751 32.7076C7.51987 32.8952 7.26537 33.0006 7.00001 33.0006C6.73464 33.0006 6.48015 32.8952 6.29251 32.7076C6.10487 32.5199 5.99945 32.2654 5.99945 32.0001C5.99945 31.7347 6.10487 31.4802 6.29251 31.2926L15.5863 22.0001L6.29251 12.7076C6.10487 12.5199 5.99945 12.2654 5.99945 12.0001C5.99945 11.7347 6.10487 11.4802 6.29251 11.2926C6.48015 11.1049 6.73464 10.9995 7.00001 10.9995C7.26537 10.9995 7.51987 11.1049 7.70751 11.2926L17.7075 21.2926C17.8005 21.3854 17.8742 21.4957 17.9246 21.6171C17.9749 21.7385 18.0008 21.8687 18.0008 22.0001C18.0008 22.1315 17.9749 22.2616 17.9246 22.383C17.8742 22.5044 17.8005 22.6147 17.7075 22.7076ZM27.7075 21.2926L17.7075 11.2926C17.5199 11.1049 17.2654 10.9995 17 10.9995C16.7346 10.9995 16.4801 11.1049 16.2925 11.2926C16.1049 11.4802 15.9995 11.7347 15.9995 12.0001C15.9995 12.2654 16.1049 12.5199 16.2925 12.7076L25.5863 22.0001L16.2925 31.2926C16.1049 31.4802 15.9995 31.7347 15.9995 32.0001C15.9995 32.2654 16.1049 32.5199 16.2925 32.7076C16.4801 32.8952 16.7346 33.0006 17 33.0006C17.2654 33.0006 17.5199 32.8952 17.7075 32.7076L27.7075 22.7076C27.8005 22.6147 27.8742 22.5044 27.9246 22.383C27.9749 22.2616 28.0008 22.1315 28.0008 22.0001C28.0008 21.8687 27.9749 21.7385 27.9246 21.6171C27.8742 21.4957 27.8005 21.3854 27.7075 21.2926Z" fill="#072B68"/>
                </svg>            
            </div>
            <div className="bg-white text-[#00377A] font-[500] p-[.8rem] px-5 gap-2 rounded-xl 
                hover:bg-[#005bb5] border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] 
                hover:text-white cursor-pointer">
            <FontAwesomeIcon icon={faPenClip} className="mr-3" />
                <span>Edit Shift</span>
            </div>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-route-name">
            {shiftSidebarInfo.route.routeName ? shiftSidebarInfo.route.routeName : "Route"}
          </div>
          <div className="comment-content flex flex-col w-full">
            {!isEditing && !comment && (
              <div 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2.5 self-start px-2 py-1 rounded hover:bg-gray-200 transition cursor-pointer"
              >
                <FontAwesomeIcon icon={faCommentDots} />
                <span>Add Comment</span>
              </div>
            )}

            {isEditing && (
              <div className="flex flex-col gap-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="border rounded-[8px] border-[var(--Bagel-Rescue-Dark-Blue)] p-2 w-full h-[52px] resize-none"
                  placeholder="Add Comment"
                />
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!shiftSidebarInfo.shift._id) return;

                      const dateKey = new Date().toISOString().split("T")[0];

                      try {
                        await updateComment(JSON.stringify({
                          shiftId: shiftSidebarInfo.shift._id.toString(),
                          date: dateKey,
                          comment: draft,
                        }));

                        setComment(draft);
                        setIsEditing(false);
                        
                      
                        if (!shiftSidebarInfo.shift.comments) {
                          shiftSidebarInfo.shift.comments = {};
                        }
                        shiftSidebarInfo.shift.comments[dateKey] = draft;
                        
                      } catch (error) {
                        console.error(error);
                        alert("Could not save comment");
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition"
                  >
                    <FontAwesomeIcon icon={faCheck} className="h-7 w-8 text-[var(--Bagel-Rescue-Dark-Blue)]" />
                  </button>
                  <button
                    onClick={() => {
                      setDraft(comment);
                      setIsEditing(false);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition"
                  >
                    <FontAwesomeIcon icon={faTrashCan} className="h-6 w-6 text-[var(--Bagel-Rescue-Error-Red)]"/>
                  </button>
                </div>
              </div>
            )}

            {!isEditing && comment && (
              <div className="sidebar-content-header flex flex-col gap-1">
                <button 
                  className="flex items-center gap-2.5 self-start px-2 py-1 rounded hover:bg-gray-200 transition"
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faPenClip} />
                  <h3 className="inline">Edit Comment</h3>
                  
                </button>
                <p className="text-[var(--Bagel-Rescue-Dark-Blue)]">{comment}</p>
                  
              </div>
            )}
          </div>
          <div className="sidebar-content-header">
            <h3> Route Locations</h3>
            {shiftSidebarInfo.location_list.map((item: string, index: number) => (
              <p key={index}>{item}</p>
            ))}
          </div>
          <div className="sidebar-content-header">
            <h3> Date Range</h3>
            <p>{new Date(shiftSidebarInfo.shift.shiftDate).toLocaleDateString(
              "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })} - {new Date(shiftSidebarInfo.shift.shiftEndDate).toLocaleDateString(
                "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Days </h3>
            <p>{getDays(shiftSidebarInfo.shift.recurrenceRule.toString())}</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Time</h3>
            <p>{new Date(shiftSidebarInfo.shift.shiftDate).toLocaleTimeString(
              "en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              }
            )} - {new Date(shiftSidebarInfo.shift.shiftEndDate).toLocaleTimeString(
              "en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
              }
            )}</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Volunteer(s) Assigned</h3>
            <div className="volunteer-container">
              
            </div>
          </div>
        </div>
    </div>
  );
};

export default ShiftSidebar;


