"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { sendVolunteerSignupEmails } from "@/server/db/actions/email";
import { handleAuthError } from "@/lib/authErrorHandler";
import { errorToast, successToast } from "@/lib/toastConfig";

function ManagementBar() {
    const router = useRouter();
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function inviteVolunteer() {
        if (!currentEmail) {
            errorToast("Please enter at least one email address.");
            return;
        }

        // Split by comma and trim whitespace
        const emailList = currentEmail
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email);

        // Basic email validation for each email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const invalidEmails = emailList.filter(
            (email) => !emailRegex.test(email)
        );

        if (invalidEmails.length > 0) {
            errorToast(
                `The following emails are invalid: ${invalidEmails.join(", ")}`
            );
            return;
        }

        setLoading(true);

        try {
            const response = await sendVolunteerSignupEmails(emailList);

            if (await response) {
                // Add to the list of sent invitations
                setEmails([...emails, ...emailList]);
                setCurrentEmail(""); // Clear the input
                successToast("Invitation(s) sent successfully!");
            }
        } catch (error) {
            if (handleAuthError(error, router)) {
                return; // Auth error handled, user redirected
            }
            console.error("Error sending invitation:", error);
            errorToast("An error occurred while sending the invitation(s).");
        }

        setLoading(false);
    }

    return (
        <>
            <div className="sticky top-0 z-50 flex min-w-0 w-full flex-row flex-wrap items-center justify-between gap-y-4 border-b border-b-[#D3D8DE] bg-white p-9">
                <span className="mt-2 shrink-0 text-4xl font-[700] text-[#072B68]">
                    Volunteer Management
                </span>
                <div className="flex min-w-0 flex-wrap items-center gap-6">
                    <button
                        type="button"
                        className="inline-flex min-w-max shrink-0 cursor-pointer flex-nowrap items-center gap-2 whitespace-nowrap rounded-xl bg-[#0F7AFF] px-5 py-[0.8rem] font-[700] text-white hover:bg-[#005bb5]"
                        onClick={() =>
                            router.push(
                                "/AdminNavView/ManagementPage/AddNewVolunteer"
                            )
                        }
                    >
                        <FontAwesomeIcon
                            icon={faPlus}
                            className="h-4 w-4 shrink-0"
                        />
                        <span>Add New Volunteer</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default ManagementBar;
