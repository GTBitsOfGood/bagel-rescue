"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSearch,
    faArrowUpShortWide,
    faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from "../../../components/AdminSidebar";
import ManagementBar from "../../components/ManagementBar";
import handleSendEmail from "./sendEmail";
import { IUser } from "@/server/db/models/User";
import { getVolunteerManagementData } from "@/server/db/actions/User";
import UserSidebar from "@/app/components/UserSidebar";

function ManagementPage() {
    const [search, setSearch] = useState<string>("");
    const [volunteers, setVolunteers] = useState<IUser[]>([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(
        null
    );

    useEffect(() => {
        fetchVolunteerData();
    }, []);

    async function fetchVolunteerData() {
        try {
            const data = await getVolunteerManagementData();
            setVolunteers(JSON.parse(data));
        } catch (error) {
            console.error("Failed to fetch volunteers:", error);
            setVolunteers([]);
        }
    }

    function formatStatus(status: string) {
        return status
            .toLowerCase()
            .split("_")
            .map(function (word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ");
    }

    return (
        <div className="flex">
            <AdminSidebar />
            <div className="flex flex-col flex-1 min-w-0">
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
                                placeholder="Search for volunteer"
                            />
                        </div>
                        <div className="flex flex-row gap-4 justify-center items-center text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]">
                            <div className="mr-[-0.4rem]">Sorted: </div>
                            <button className="px-5 py-[.6rem] rounded-lg space-x-2 border bg-white">
                                <span>Alphabetically</span>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                            <button className="px-5 py-[.6rem] rounded-lg space-x-2 border bg-white">
                                <span>Filter</span>
                            </button>
                        </div>
                    </div>
                    {/* Content will go here */}
                    {selectedVolunteer && (
                        <UserSidebar
                            userId={selectedVolunteer}
                            onClose={() => setSelectedVolunteer(null)}
                        />
                    )}
                    <div className="w-full h-full flex flex-col gap-4 pb-4">
                        <div className="w-full flex flex-row items-center py-4 px-[3.5rem] gap-x-12 bg-blue-200 rounded-lg text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]">
                            <p className="w-[10rem]">Name</p>
                            <p className="w-[17rem]">Locations</p>
                            <p className="w-[14.5rem]">Status</p>
                            <p className="w-[7rem]">Shifts</p>
                            <p className="w-[8rem]">Volunteer Time</p>
                        </div>
                        <div className="w-full h-full flex flex-col gap-4">
                            {volunteers.map((volunteer, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        setSelectedVolunteer(
                                            volunteer._id!.toString()
                                        )
                                    }
                                    className="w-full flex flex-row justify-start items-center py-4 px-[3.5rem] gap-x-12 border-2 rounded-lg border-[var(--Bagel-Rescue-Light-Grey-2,#d3d8de)] bg-white text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]"
                                >
                                    <p className="w-[10rem] flex justify-start items-center text-start">
                                        {volunteer.firstName}{" "}
                                        {volunteer.lastName}
                                    </p>
                                    <div className="w-[17rem] flex flex-row justify-start items-center gap-1">
                                        {volunteer?.locations
                                            ?.slice(0, 3)
                                            .map((location, i) => (
                                                <div
                                                    key={i}
                                                    className="text-[0.75rem] bg-[#F2F2F2] rounded-lg px-2 py-[0.2rem]"
                                                >
                                                    {location}
                                                </div>
                                            ))}
                                        {volunteer.locations &&
                                            volunteer.locations.length > 3 && (
                                                <div className="text-[0.75rem] bg-[#F2F2F2] rounded-lg px-2 py-[0.2rem]">
                                                    ...
                                                </div>
                                            )}
                                    </div>
                                    <div className="w-[14.5rem]">
                                        <div
                                            className={`w-[9rem] flex justify-center items-center text-[0.75rem] rounded-lg px-2 py-[0.2rem]
                      ${
                          volunteer.status === "ACTIVE"
                              ? "bg-[#C8FFE3] text-green-900"
                              : volunteer.status === "SEND_INVITE"
                              ? "bg-[#FFDAC8] text-[#501B00]"
                              : volunteer.status === "INVITE_SENT"
                              ? "bg-[#FBFFC8] text-[#3D4200]"
                              : ""
                      }`}
                                            onClick={() => {
                                                if (
                                                    volunteer.status ===
                                                        "SEND_INVITE" &&
                                                    volunteer._id !== undefined
                                                ) {
                                                    try {
                                                        handleSendEmail(
                                                            volunteer._id.toString()
                                                        ).then((res) => {
                                                            if (!res) {
                                                                alert(
                                                                    "Failed to send email!"
                                                                );
                                                                return;
                                                            }

                                                            alert(
                                                                "Email sent successfully!"
                                                            );
                                                            setVolunteers(
                                                                volunteers.map(
                                                                    (v) => {
                                                                        if (
                                                                            v._id ===
                                                                            volunteer._id
                                                                        ) {
                                                                            return {
                                                                                ...v,
                                                                                status: "INVITE_SENT",
                                                                            };
                                                                        }
                                                                        return v;
                                                                    }
                                                                )
                                                            );
                                                        });
                                                    } catch (error) {
                                                        console.error(
                                                            "Error sending email:",
                                                            error
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            {formatStatus(
                                                volunteer.status ?? ""
                                            )}
                                            {volunteer.status ===
                                                "SEND_INVITE" && (
                                                <div className="pl-2">
                                                    <svg
                                                        width="10"
                                                        height="10"
                                                        viewBox="0 0 17 17"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="inline-block align-middle gap-1"
                                                    >
                                                        <path
                                                            d="M8.5 2.5H2.5C1.96957 2.5 1.46086 2.71071 1.08579 3.08579C0.710714 3.46086 0.5 3.96957 0.5 4.5V14.5C0.5 15.0304 0.710714 15.5391 1.08579 15.9142C1.46086 16.2893 1.96957 16.5 2.5 16.5H12.5C13.0304 16.5 13.5391 16.2893 13.9142 15.9142C14.2893 15.5391 14.5 15.0304 14.5 14.5V8.5M7.5 9.5L16.5 0.5M16.5 0.5H11.5M16.5 0.5V5.5"
                                                            stroke="#59431B"
                                                            stroke-linecap="round"
                                                            stroke-linejoin="round"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="w-[7rem] flex justify-start items-center">
                                        {volunteer.monthlyShifts &&
                                        Object.keys(volunteer.monthlyShifts)
                                            .length > 0
                                            ? volunteer.monthlyShifts[
                                                  Object.keys(
                                                      volunteer.monthlyShifts
                                                  )[
                                                      Object.keys(
                                                          volunteer.monthlyShifts
                                                      ).length - 1
                                                  ]
                                              ].totalShifts
                                            : 0}
                                    </p>
                                    <p className="w-[8rem] flex justify-start items-center">
                                        {volunteer.monthlyShifts &&
                                        Object.keys(volunteer.monthlyShifts)
                                            .length > 0
                                            ? `${
                                                  volunteer.monthlyShifts[
                                                      Object.keys(
                                                          volunteer.monthlyShifts
                                                      )[
                                                          Object.keys(
                                                              volunteer.monthlyShifts
                                                          ).length - 1
                                                      ]
                                                  ].shiftTime
                                              } hours`
                                            : "0 hours"}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagementPage;
