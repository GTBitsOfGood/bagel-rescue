import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { Shift } from "@/server/db/models/shift";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpShortWide } from "@fortawesome/free-solid-svg-icons";
import { faPenClip } from "@fortawesome/free-solid-svg-icons";
interface ShiftSidebarProps {
    shift: Shift;
}
import "./stylesheet.css";

const ShiftSidebar: React.FC<ShiftSidebarProps> = ({shift}) => {
  return (
    <div className="main-sidebar">
        <div className="sidebar-header">
            <FontAwesomeIcon icon={faArrowUpShortWide}/>
            <div className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem] px-5 gap-2 rounded-xl hover:bg-[#005bb5] cursor-pointer">
                      <FontAwesomeIcon icon={faPenClip} className="mr-3" />
                      <span>Edit Shift</span>
            </div>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-content-header">
            <h3> Route Locations</h3>
            <p>Atlanta</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Date Range</h3>
            <p>{new Date(shift.shiftDate).toLocaleDateString(
              "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })} - {new Date(shift.shiftEndDate).toLocaleDateString(
                "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Days </h3>
            <p>{shift.recurrenceRule.toString()}</p>
          </div>
          <div className="sidebar-content-header">
            <h3> Time</h3>
            <p>{new Date(shift.shiftDate).toLocaleTimeString()} - {new Date(shift.shiftEndDate).toLocaleTimeString()}</p>
          </div>
        </div>
    </div>
  );
};

export default ShiftSidebar;


