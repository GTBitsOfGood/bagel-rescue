"use client";

import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowUpShortWide,
  faChevronDown,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from "../../../components/AdminSidebar";
import ManagementBar from "../../components/ManagementBar";
import handleSendEmail from "./sendEmail";
import { IUser } from "@/server/db/models/User";
import {
  getVolunteerManagementData,
  deleteUser,
} from "@/server/db/actions/User";
import UserSidebar from "@/app/components/UserSidebar";
import { errorToast, successToast } from "@/lib/toastConfig";
import VolunteerEllipsisModal from "./VolunteerEllipsisModal";
import VolunteerDeletionModal from "./VolunteerDeletionModal";
import { useRouter } from "next/navigation";
import { handleAuthError } from "@/lib/authErrorHandler";
import LoadingFallback from "@/app/components/LoadingFallback";

function ManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState<string>("");
  const [volunteers, setVolunteers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string | null>(
    null,
  );
  const [openSidebarInEditMode, setOpenSidebarInEditMode] =
    useState<boolean>(false);

  const [ellipsisModalOpenFor, setEllipsisModalOpenFor] = useState<
    string | null
  >(null);
  const [ellipsisModalPosition, setEllipsisModalPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const ellipsisButtonRefs = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [volunteerToDelete, setVolunteerToDelete] = useState<IUser | null>(
    null,
  );

  useEffect(() => {
    const fetchVolunteerData = async () => {
      setIsLoading(true);
      try {
        const data = await getVolunteerManagementData();
        setVolunteers(JSON.parse(data));
      } catch (error) {
        if (handleAuthError(error, router)) {
          return;
        }
        console.error("Failed to fetch volunteers:", error);
        setVolunteers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolunteerData();
  }, [router]);

  function formatStatus(status: string) {
    return status
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const updateEllipsisModalPosition = (volunteerId: string) => {
    const button = ellipsisButtonRefs.current[volunteerId];
    if (!button) return;

    const rect = button.getBoundingClientRect();

    setEllipsisModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom - 6,
    });
  };

  const handleEllipsisClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    volunteerId: string,
  ) => {
    e.stopPropagation();

    if (ellipsisModalOpenFor === volunteerId) {
      setEllipsisModalOpenFor(null);
      return;
    }

    updateEllipsisModalPosition(volunteerId);
    setEllipsisModalOpenFor(volunteerId);
  };

  useEffect(() => {
    if (!ellipsisModalOpenFor) return;

    const handleWindowResize = () => {
      updateEllipsisModalPosition(ellipsisModalOpenFor);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [ellipsisModalOpenFor]);

  const handleCloseMenu = () => {
    setEllipsisModalOpenFor(null);
  };

  const handleEditVolunteer = (volunteerId: string) => {
    handleCloseMenu();
    setOpenSidebarInEditMode(true);
    setSelectedVolunteer(volunteerId);
  };

  const handleDeleteVolunteer = (volunteerId: string) => {
    handleCloseMenu();

    const volunteer = volunteers.find((v) => v._id?.toString() === volunteerId);
    if (!volunteer) return;

    setVolunteerToDelete(volunteer);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteVolunteer = async () => {
    if (!volunteerToDelete?._id) return;

    try {
      const volunteerId = volunteerToDelete._id.toString();
      await deleteUser(volunteerId);

      setVolunteers((prev) =>
        prev.filter(
          (v) => v._id?.toString() !== volunteerToDelete._id?.toString(),
        ),
      );

      if (selectedVolunteer === volunteerId) {
        setSelectedVolunteer(null);
        setOpenSidebarInEditMode(false);
      }

      successToast("Volunteer deleted successfully!");
    } catch (error) {
      console.error("Error deleting volunteer:", error);
      errorToast("Failed to delete volunteer!");
    } finally {
      setDeleteModalOpen(false);
      setVolunteerToDelete(null);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const fullName = `${volunteer.firstName ?? ""} ${
      volunteer.lastName ?? ""
    }`.toLowerCase();

    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-white">
        <ManagementBar />

        <div className="flex min-h-0 flex-1 flex-col gap-6 bg-[#ECF2F9] pl-9 pr-9">
          <div className="mt-6 flex min-w-0 flex-wrap items-center justify-between gap-4 text-[#6C7D93]">
            <div className="flex shrink-0 items-center gap-2 rounded-xl border bg-white px-5 py-[0.6rem]">
              <FontAwesomeIcon
                icon={faArrowUpShortWide}
                className="h-4 w-4 shrink-0"
                style={{
                  width: "1rem",
                  height: "1rem",
                  maxWidth: "1rem",
                  maxHeight: "1rem",
                }}
              />
              <span>Sort by</span>
            </div>

            <div className="flex min-w-0 max-w-full flex-1 basis-[min(100%,24rem)] items-center gap-2 rounded-[2.5rem] border bg-white px-5 py-[0.6rem] sm:min-w-[min(100%,24rem)] sm:flex-initial sm:basis-auto">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="h-4 w-4 shrink-0 text-[#6C7D93]"
              />
              <input
                className="min-w-0 flex-1 outline-none"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Search for volunteer"
              />
            </div>

            <div className="flex shrink-0 flex-row flex-wrap items-center justify-center gap-4 text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]">
              <div className="mr-[-0.4rem]">Sorted: </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border bg-white px-5 py-[0.6rem]"
              >
                <span>Alphabetically</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="h-3 w-3 shrink-0"
                />
              </button>
              <button
                type="button"
                className="rounded-lg border bg-white px-5 py-[0.6rem]"
              >
                <span>Filter</span>
              </button>
            </div>
          </div>

          {selectedVolunteer && (
            <UserSidebar
              userId={selectedVolunteer}
              openInEditMode={openSidebarInEditMode}
              onClose={() => {
                setOpenSidebarInEditMode(false);
                setSelectedVolunteer(null);
              }}
            />
          )}

          <div className="flex min-h-0 w-full flex-1 flex-col gap-4 pb-4">
            {isLoading ? (
              <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center py-12">
                <LoadingFallback />
              </div>
            ) : (
              <>
            <div className="flex w-full flex-row items-center gap-x-12 rounded-lg bg-blue-200 px-[2rem] py-4 text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]">
              <p className="w-[10rem]">Name</p>
              <p className="w-[17rem]">Locations</p>
              <p className="w-[14.5rem]">Status</p>
              <p className="w-[7rem]">Shifts</p>
              <p className="w-[10rem]">Volunteer Time</p>
            </div>

            <div className="mb-10 flex h-full w-full flex-col gap-4">
              {filteredVolunteers.map((volunteer, index) => (
                <div
                  key={volunteer._id?.toString() ?? index}
                  onClick={() => {
                    if (!volunteer._id) return;
                    setOpenSidebarInEditMode(false);
                    setSelectedVolunteer(volunteer._id.toString());
                  }}
                  className="w-full flex flex-row justify-start items-center py-4 px-[2rem] gap-x-12 border-2 rounded-lg border-[var(--Bagel-Rescue-Light-Grey-2,#d3d8de)] bg-white text-[var(--Bagel-Rescue-Dark-Blue-2,#072b68)]"
                >
                  <p className="w-[10rem] flex justify-start items-center text-start">
                    {volunteer.firstName} {volunteer.lastName}
                  </p>

                  <div className="w-[17rem] flex flex-row justify-start items-center gap-1">
                    {volunteer?.locations?.slice(0, 3).map((location, i) => (
                      <div
                        key={i}
                        className="text-[0.75rem] bg-[#F2F2F2] rounded-lg px-2 py-[0.2rem]"
                      >
                        {location}
                      </div>
                    ))}
                    {volunteer.locations && volunteer.locations.length > 3 && (
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
                      onClick={(e) => {
                        e.stopPropagation();

                        if (
                          volunteer.status === "SEND_INVITE" &&
                          volunteer._id !== undefined
                        ) {
                          try {
                            handleSendEmail(volunteer._id.toString()).then(
                              (res) => {
                                if (!res) {
                                  errorToast("Failed to send email!");
                                  return;
                                }

                                successToast("Email sent successfully!");
                                setVolunteers((prev) =>
                                  prev.map((v) => {
                                    if (v._id === volunteer._id) {
                                      return {
                                        ...v,
                                        status: "INVITE_SENT",
                                      };
                                    }
                                    return v;
                                  }),
                                );
                              },
                            );
                          } catch (error) {
                            console.error("Error sending email:", error);
                            errorToast("Failed to send email!");
                          }
                        }
                      }}
                    >
                      {formatStatus(volunteer.status ?? "")}
                      {volunteer.status === "SEND_INVITE" && (
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
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="w-[7rem] flex justify-start items-center">
                    {volunteer.monthlyShifts &&
                    Object.keys(volunteer.monthlyShifts).length > 0
                      ? volunteer.monthlyShifts[
                          Object.keys(volunteer.monthlyShifts)[
                            Object.keys(volunteer.monthlyShifts).length - 1
                          ]
                        ].totalShifts
                      : 0}
                  </p>

                  <div className="w-[10rem] flex justify-between items-center gap-2">
                    <p>
                      {volunteer.monthlyShifts &&
                      Object.keys(volunteer.monthlyShifts).length > 0
                        ? `${
                            volunteer.monthlyShifts[
                              Object.keys(volunteer.monthlyShifts)[
                                Object.keys(volunteer.monthlyShifts).length - 1
                              ]
                            ].shiftTime
                          } hours`
                        : "0 hours"}
                    </p>

                    <button
                      ref={(element) => {
                        if (!volunteer._id) return;
                        ellipsisButtonRefs.current[volunteer._id.toString()] =
                          element;
                      }}
                      type="button"
                      onClick={(e) => {
                        if (!volunteer._id) return;
                        handleEllipsisClick(e, volunteer._id.toString());
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="rounded-md px-2 py-[1px] transition-colors duration-150 hover:bg-gray-100"
                      aria-label="More options"
                    >
                      <FontAwesomeIcon
                        icon={faEllipsisH}
                        className="h-4 w-4 shrink-0"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>

          <VolunteerEllipsisModal
            isOpen={ellipsisModalOpenFor !== null}
            onClose={handleCloseMenu}
            onEdit={() => {
              if (!ellipsisModalOpenFor) return;
              handleEditVolunteer(ellipsisModalOpenFor);
            }}
            onDelete={() => {
              if (!ellipsisModalOpenFor) return;
              handleDeleteVolunteer(ellipsisModalOpenFor);
            }}
            position={ellipsisModalPosition}
          />

          <VolunteerDeletionModal
            isOpen={deleteModalOpen}
            volunteerName={
              volunteerToDelete
                ? `${volunteerToDelete.firstName} ${volunteerToDelete.lastName}`
                : undefined
            }
            onClose={() => {
              setDeleteModalOpen(false);
              setVolunteerToDelete(null);
            }}
            onConfirm={handleConfirmDeleteVolunteer}
          />
        </div>
      </div>
    </div>
  );
}

export default ManagementPage;
