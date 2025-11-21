"use client";

import React, { useState, useEffect } from "react";
import { Shift } from "@/server/db/models/shift";
import { updateComment } from "@/server/db/actions/shift";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faPenClip,
    faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import "./stylesheet.css";
import { getShiftUsers } from "@/server/db/actions/userShifts";
import { IRoute } from "@/server/db/models/Route";
import { useRouter } from "next/navigation";
import { formattedDateFull } from "@/lib/dateHandler";

export type ShiftSidebarInfo = {
    shift: Shift;
    route: IRoute;
    shiftDate: Date;
    location_list: string[];
};

interface ShiftSidebarProps {
    shiftSidebarInfo: ShiftSidebarInfo;
    onOpenSidebar: () => void;
}

const dayMap: { [key: string]: string } = {
    mo: "Monday",
    tu: "Tuesday",
    we: "Wednesday",
    th: "Thursday",
    fr: "Friday",
    sa: "Saturday",
    su: "Sunday",
};

const getDays = (recurrenceDates: string[]): string => {
    try {
        return recurrenceDates.map((day) => dayMap[day]).join(", ");
    } catch (error) {
        return "--"; // Return original if parsing fails
    }
};

const ShiftSidebar: React.FC<ShiftSidebarProps> = ({
    shiftSidebarInfo,
    onOpenSidebar,
}) => {
    const shift = shiftSidebarInfo.shift;
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [comment, setComment] = useState("");
    const [draft, setDraft] = useState("");
    const [hasLoaded, setHasLoaded] = useState(false);

    const [volunteers, setVolunteers] = useState<string[]>([]);
    useEffect(() => {
        if (!hasLoaded) {
            const comments = shift.comments;
            if (
                comments &&
                typeof comments === "object" &&
                Object.keys(comments).length > 0
            ) {
                const currentDateComment =
                    comments[
                        shiftSidebarInfo.shiftDate.toISOString().split("T")[0]
                    ];
                setComment(currentDateComment || "");
                setDraft(currentDateComment || "");
            }
            setHasLoaded(true);
        }
    }, [shift._id, hasLoaded, shift.comments]);

    useEffect(() => {
        setHasLoaded(false);
    }, [shift._id]);

    useEffect(() => {
        const fetchshiftUsers = async () => {
            try {
                const response = await getShiftUsers([shift._id.toString()]);
                const volunteerNames = response.map((res) => res.fullName);
                setVolunteers(volunteerNames);
            } catch (error) {
                console.error("Error fetching volunteers for shift:", error);
            }
        };

        fetchshiftUsers();
    }, [shift]);

    const handleEditClick = () => {
        router.push(`/AdminNavView/EditShift/${shift._id}`);
        // Note: In App Router, navigation is immediate and doesn't return a promise
    };

    console.log(typeof shift.shiftStartDate);

    return (
        <div className="main-sidebar">
            <div className="sidebar-header">
                <div className="arrow-box" onClick={onOpenSidebar}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="44"
                        viewBox="0 0 32 44"
                        fill="none"
                    >
                        <path
                            d="M17.7075 22.7076L7.70751 32.7076C7.51987 32.8952 7.26537 33.0006 7.00001 33.0006C6.73464 33.0006 6.48015 32.8952 6.29251 32.7076C6.10487 32.5199 5.99945 32.2654 5.99945 32.0001C5.99945 31.7347 6.10487 31.4802 6.29251 31.2926L15.5863 22.0001L6.29251 12.7076C6.10487 12.5199 5.99945 12.2654 5.99945 12.0001C5.99945 11.7347 6.10487 11.4802 6.29251 11.2926C6.48015 11.1049 6.73464 10.9995 7.00001 10.9995C7.26537 10.9995 7.51987 11.1049 7.70751 11.2926L17.7075 21.2926C17.8005 21.3854 17.8742 21.4957 17.9246 21.6171C17.9749 21.7385 18.0008 21.8687 18.0008 22.0001C18.0008 22.1315 17.9749 22.2616 17.9246 22.383C17.8742 22.5044 17.8005 22.6147 17.7075 22.7076ZM27.7075 21.2926L17.7075 11.2926C17.5199 11.1049 17.2654 10.9995 17 10.9995C16.7346 10.9995 16.4801 11.1049 16.2925 11.2926C16.1049 11.4802 15.9995 11.7347 15.9995 12.0001C15.9995 12.2654 16.1049 12.5199 16.2925 12.7076L25.5863 22.0001L16.2925 31.2926C16.1049 31.4802 15.9995 31.7347 15.9995 32.0001C15.9995 32.2654 16.1049 32.5199 16.2925 32.7076C16.4801 32.8952 16.7346 33.0006 17 33.0006C17.2654 33.0006 17.5199 32.8952 17.7075 32.7076L27.7075 22.7076C27.8005 22.6147 27.8742 22.5044 27.9246 22.383C27.9749 22.2616 28.0008 22.1315 28.0008 22.0001C28.0008 21.8687 27.9749 21.7385 27.9246 21.6171C27.8742 21.4957 27.8005 21.3854 27.7075 21.2926Z"
                            fill="#072B68"
                        />
                    </svg>
                </div>
                <div
                    onClick={handleEditClick}
                    className="bg-white text-[#00377A] font-[500] p-[.8rem] px-5 gap-2 rounded-xl 
        hover:bg-[#005bb5] border-2 border-[var(--Bagel-Rescue-Light-Grey,#D3D8DE)] 
        hover:text-white cursor-pointer"
                >
                    <FontAwesomeIcon icon={faPenClip} className="mr-3" />
                    <span>Edit Shift</span>
                </div>
            </div>
            <div className="sidebar-content">
                <div className="sidebar-route-name">
                    {shiftSidebarInfo?.route?.routeName ?? "Route"}
                </div>
                {/* Comment Section */}
                <div className="comment-content flex flex-col w-full">
                    {!isEditing && !comment && (
                        <div
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2.5 self-start rounded hover:underline transition cursor-pointer"
                        >
                            <svg
                                width="21"
                                height="20"
                                viewBox="0 0 21 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M6.5 12.9639H15.5C15.755 12.9639 15.9689 12.8761 16.1417 12.7007C16.3145 12.5253 16.4006 12.3085 16.4 12.0502C16.3994 11.7919 16.313 11.5751 16.1408 11.3997C15.9686 11.2243 15.755 11.1365 15.5 11.1365H6.5C6.245 11.1365 6.0314 11.2243 5.8592 11.3997C5.687 11.5751 5.6006 11.7919 5.6 12.0502C5.5994 12.3085 5.6858 12.5256 5.8592 12.7016C6.0326 12.8777 6.2462 12.9651 6.5 12.9639ZM6.5 10.2229H15.5C15.755 10.2229 15.9689 10.1352 16.1417 9.95976C16.3145 9.78434 16.4006 9.56749 16.4 9.30924C16.3994 9.05098 16.313 8.83414 16.1408 8.65871C15.9686 8.48329 15.755 8.39558 15.5 8.39558H6.5C6.245 8.39558 6.0314 8.48329 5.8592 8.65871C5.687 8.83414 5.6006 9.05098 5.6 9.30924C5.5994 9.56749 5.6858 9.78464 5.8592 9.96067C6.0326 10.1367 6.2462 10.2241 6.5 10.2229ZM6.5 7.48193H15.5C15.755 7.48193 15.9689 7.39422 16.1417 7.21879C16.3145 7.04337 16.4006 6.82653 16.4 6.56827C16.3994 6.31001 16.313 6.09317 16.1408 5.91775C15.9686 5.74233 15.755 5.65462 15.5 5.65462H6.5C6.245 5.65462 6.0314 5.74233 5.8592 5.91775C5.687 6.09317 5.6006 6.31001 5.6 6.56827C5.5994 6.82653 5.6858 7.04368 5.8592 7.21971C6.0326 7.39574 6.2462 7.48314 6.5 7.48193ZM3.8 16.6185C3.305 16.6185 2.8814 16.4397 2.5292 16.0822C2.177 15.7246 2.0006 15.2943 2 14.7912V3.82731C2 3.3248 2.1764 2.89477 2.5292 2.53723C2.882 2.17969 3.3056 2.00061 3.8 2H18.2C18.695 2 19.1189 2.17908 19.4717 2.53723C19.8245 2.89538 20.0006 3.32541 20 3.82731V18.0575C20 18.4686 19.8164 18.7543 19.4492 18.9145C19.082 19.0747 18.7556 19.0098 18.47 18.7199L16.4 16.6185H3.8ZM17.165 14.7912L18.2 15.819V3.82731H3.8V14.7912H17.165Z"
                                    fill="var(--Bagel-Rescue-Dark-Blue)"
                                />
                            </svg>
                            <span>Add Comment</span>
                        </div>
                    )}

                    {isEditing && (
                        <div className="flex flex-col gap-4">
                            <textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                className="border rounded-[8px] border-[var(--Bagel-Rescue-Dark-Blue)] w-full h-[52px] resize-none py-[14px] pl-4"
                                placeholder="Add Comment"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={async () => {
                                        if (!shift._id) return;

                                        const dateKey =
                                            shiftSidebarInfo.shiftDate
                                                .toISOString()
                                                .split("T")[0];

                                        try {
                                            await updateComment(
                                                JSON.stringify({
                                                    shiftId:
                                                        shift._id.toString(),
                                                    date: dateKey,
                                                    comment: draft,
                                                })
                                            );

                                            setComment(draft);
                                            setIsEditing(false);

                                            if (!shift.comments) {
                                                shift.comments = {};
                                            }
                                            shift.comments[dateKey] = draft;
                                        } catch (error) {
                                            console.error(error);
                                            alert("Could not save comment");
                                        }
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition"
                                >
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        className="h-7 w-8 text-[var(--Bagel-Rescue-Dark-Blue)]"
                                    />
                                </button>
                                <button
                                    onClick={() => {
                                        setDraft(comment);
                                        setIsEditing(false);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-200 transition"
                                >
                                    <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className="h-6 w-6 text-[var(--Bagel-Rescue-Error-Red)]"
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {!isEditing && comment && (
                        <div className="sidebar-content-header flex flex-col gap-1 w-max max-w-[390px] h-max">
                            <button
                                className="flex items-center gap-2.5 self-start rounded hover:underline transition"
                                onClick={() => setIsEditing(true)}
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M17.7586 5.73203L14.268 2.24062C14.1519 2.12452 14.0141 2.03242 13.8624 1.96958C13.7107 1.90675 13.5482 1.8744 13.384 1.8744C13.2198 1.8744 13.0572 1.90675 12.9056 1.96958C12.7539 2.03242 12.6161 2.12452 12.5 2.24062L2.86641 11.875C2.74983 11.9907 2.65741 12.1283 2.59451 12.28C2.5316 12.4317 2.49948 12.5944 2.50001 12.7586V16.25C2.50001 16.5815 2.6317 16.8995 2.86612 17.1339C3.10054 17.3683 3.41849 17.5 3.75001 17.5H7.24141C7.40563 17.5005 7.5683 17.4684 7.71999 17.4055C7.87168 17.3426 8.00935 17.2502 8.12501 17.1336L17.7586 7.5C17.8747 7.38392 17.9668 7.24611 18.0296 7.09443C18.0925 6.94276 18.1248 6.78019 18.1248 6.61601C18.1248 6.45184 18.0925 6.28927 18.0296 6.13759C17.9668 5.98592 17.8747 5.84811 17.7586 5.73203ZM4.0086 12.5L10.625 5.88359L11.9289 7.1875L5.31251 13.8031L4.0086 12.5ZM3.75001 14.0086L5.99141 16.25H3.75001V14.0086ZM7.50001 15.9914L6.1961 14.6875L12.8125 8.07109L14.1164 9.375L7.50001 15.9914ZM15 8.4914L11.5086 5L13.3836 3.125L16.875 6.61562L15 8.4914Z"
                                        fill="var(--Bagel-Rescue-Dark-Blue)"
                                    />
                                </svg>
                                <h3 className="inline">Edit Comment</h3>
                            </button>
                            <p className="text-[var(--Bagel-Rescue-Dark-Blue)]">
                                {comment}
                            </p>
                        </div>
                    )}
                </div>

                <div className="sidebar-content-header">
                    <h3> Route Locations</h3>
                    {shiftSidebarInfo.location_list.map(
                        (item: string, index: number) => (
                            <p key={index}>{item}</p>
                        )
                    )}
                </div>
                {shiftSidebarInfo?.route?.additionalInfo && (
                    <div className="sidebar-content-header">
                        <h3> Route Information</h3>
                        {shiftSidebarInfo.route.additionalInfo}
                    </div>
                )}
                <div className="sidebar-content-header">
                    <h3> Date Range</h3>
                    <p>
                        {formattedDateFull(new Date(shift.shiftStartDate))}{" "}
                        - {formattedDateFull(new Date(shift.shiftEndDate))}
                    </p>
                </div>
                <div className="sidebar-content-header">
                    <h3> Days </h3>
                    <p>{getDays(shift.recurrenceDates)}</p>
                </div>
                <div className="sidebar-content-header">
                    <h3> Time</h3>
                    <p>
                        {new Date(shift.shiftStartTime).toLocaleTimeString(
                            "en-US",
                            {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            }
                        )}{" "}
                        -{" "}
                        {new Date(shift.shiftEndTime).toLocaleTimeString(
                            "en-US",
                            {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                            }
                        )}
                    </p>
                </div>
                <div className="sidebar-content-header">
                    <h3 className="margin-bottom-15px">
                        Volunteer(s) Assigned
                    </h3>
                    <div className="volunteer-container">
                        {volunteers.map((name) => (
                            <div
                                className="volunteer-item"
                                key={shift._id.toString()}
                            >
                                <p className="volunteer-name">{name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {shift.additionalInfo && (
                    <div className="sidebar-content-header">
                        <h3> Additional Information </h3>
                        <p>{shift.additionalInfo}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftSidebar;
