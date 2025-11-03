"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowUpShortWide,
} from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from "../../../components/AdminSidebar";
import ManagementBar from "../../components/ManagementBar";
import { getUser } from "@/server/db/actions/User";
import { sendVolunteerSignupEmail } from "@/server/db/actions/email";
import { IUser } from "@/server/db/models/User";

function ManagementPage() {
  const [search, setSearch] = useState<string>("");

  // extract to volunteer card component
  const handleSendEmail = async (userId: string) => {
    try {
      const user = (await getUser(userId)) as IUser;
      console.log(user);
      await sendVolunteerSignupEmail(user?.email, user?.firstName);
    } catch (err) {
      console.error("Failed to fetch user with id ", userId, err);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex flex-col flex-1">
        <ManagementBar />
        <div className="bg-[#ECF2F9] flex flex-col pl-9 pr-9 gap-6 min-h-screen">
          <div className="flex justify-between text-[#6C7D93] mt-6">
            <div className="px-5 py-[.6rem] rounded-xl space-x-2 border bg-white">
              <FontAwesomeIcon icon={faArrowUpShortWide} />
              <span>Sort by</span>
            </div>
            <div className="flex min-w-96 border px-5 py-[.6rem] justify-start gap-2 rounded-[2.5rem] bg-white">
              <FontAwesomeIcon icon={faSearch} className="mt-1" />
              <input
                className="min-w-96 outline-none"
                type="search"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search for volunteers"
              />
            </div>
          </div>
          {/* Content will go here */}
          <button
            className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] w-[150px] py-[10px] rounded-xl hover:bg-[#005bb5] cursor-pointer"
            // when you extract this button to a component for each volunteer/user
            // pass in the user id prop here as a param
            // also, extract handleSendEmail to that component
            onClick={() => handleSendEmail("69038bf9cd333dd1f5602e33")}
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagementPage;
