'use client'
import ShiftCompletionForm from "@/components/ShiftCompletionForm";
import Sidebar from "@/components/Sidebar";
import React from "react";


export default function FormTest() {

    function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
        console.log("Form submitted");
    }
  return (
    <div className="flex">
      <Sidebar/>
      <div className="flex flex-col w-full">
        <div className="flex flex-col p-9 justify-start space-y-6 bg-white border-b w-full">
            <button className="opacity-50 text-left content-start text-base items-center space-x-3 flex">
              <svg className="w-[.75rem]" xmlns="http://www.w3.org/2000/svg" width="12" height="17" viewBox="0 0 12 17" fill="none">
                <path d="M10 2L2 8.5L10 15" stroke="#072B68" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>  
               <span className="text-base">Back</span>
            </button>
            <h1 className="text-4xl font-bold text-[#072B68]">Post-Shift Form</h1>
        </div>
        <div className="w-full h-full p-9 bg-[var(--Bagel-Rescue-Light-Blue-2,#ECF2F9)]">
          <ShiftCompletionForm/>
        </div>
      </div>
    </div>
  );
};