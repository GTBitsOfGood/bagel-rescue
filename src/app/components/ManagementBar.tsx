"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { sendVolunteerSignupEmails } from "@/server/db/actions/email";
import { handleAuthError } from "@/lib/authErrorHandler";

function ManagementBar() {
    const router = useRouter();
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function inviteVolunteer() {
        if (!currentEmail) {
            alert("Please enter at least one email address.");
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
            alert(
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
                alert("Invitation(s) sent successfully!");
            }
        } catch (error) {
            if (handleAuthError(error, router)) {
                return; // Auth error handled, user redirected
            }
            console.error("Error sending invitation:", error);
            alert("An error occurred while sending the invitation(s).");
        }

        setLoading(false);
    }

    return (
        <div className="flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE] sticky top-0 bg-white h-[7.7rem]">
            <span className="text-[#072B68] mt-2 font-[700] text-4xl">
                Volunteer Management
            </span>
            <div className="flex gap-6">
                <div
                    className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem] px-5 gap-2 rounded-xl hover:bg-[#005bb5] cursor-pointer"
                    onClick={() =>
                        router.push(
                            "/AdminNavView/ManagementPage/AddNewVolunteer"
                        )
                    }
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-3" />
                    <span>Add New Volunteer</span>
                </div>
            </div>
        </div>
    );
}

export default ManagementBar;
