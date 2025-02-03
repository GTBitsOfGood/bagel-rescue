'use client';

import { sendVolunteerSignupEmails } from "@/server/db/actions/email";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function VolunteerAccountCreation() {
    
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);

    function addEmail(email: string) {
        setEmails([...emails, email]);
    }

    function removeEmail(email: string) {
        setEmails(emails.filter((e) => e !== email));
    }

    function displayEmails() {
        return emails.map((email) => (
            <div key={email} role="button" className="border-slate-20 shadow-lg bg-white text-slate-800 flex w-full items-center rounded-md p-2 pl-3 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100">
                {email}
                <div className="ml-auto grid place-items-center justify-self-end">
                    <button className="rounded-md border border-transparent p-2.5 text-center text-sm transition-all text-slate-600 hover:bg-slate-200 focus:bg-slate-200 active:bg-slate-200" type="button" onClick={() => removeEmail(email)}>
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                </div>
            </div>
        ));
    }

    function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        if (emails.indexOf(currentEmail) !== -1) {
            alert("Email already added");
            return;
        }

        if (currentEmail) {
            addEmail(currentEmail);
            setCurrentEmail("");
        } else {
            console.error("Please enter a valid email address.");
        }
    }

    async function inviteVolunteers() {
        setLoading(true);
        if (emails.length === 0) {
            alert("No emails to send invitations to.");
            return;
        }

        try {
            const response = await sendVolunteerSignupEmails(emails);

            if (await response) {
                setEmails([]);
                setLoading(false);
                alert("Invitations sent successfully!");
            } 
        } catch (error) {
            console.error("Error sending invitations:", error);
            alert("An error occurred while sending invitations.");
        }
        setLoading(false);
    }


  return (
    <div className={"flex items-center justify-center min-h-screen"}>
        <div className={"flex justify-around h-[45rem] w-5/6 bg-gray-200 shadow-lg rounded-xl"}>
            <form 
                onSubmit={(e) => {handleSubmit(e)}}
            className="w-full content-center max-w-sm min-w-[200px]"
            >
                <label className="block mb-2 text-sm text-slate-600">
                    Add Volunteer Email 🥯
                </label>
                <div className="relative">
                    <input 
                    type="email"
                    required
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-16 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" 
                    placeholder="Email Address" 
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    />
                    <button
                    className="absolute right-1 top-1 rounded bg-slate-700 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-600 active:shadow-none"
                    type="submit"
                    >
                    Add Email
                    </button>
                </div>
                {!loading ? <button
                className="ml-36 mt-10 rounded bg-slate-700 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-600 active:shadow-none"
                type="button"
                onClick={async () => inviteVolunteers()}
                >
                Invite Volunteers
                </button> : <div className="ml-36 mt-10 content-center spinner animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>}
            </form>
            
            <div className="p-2 relative flex flex-col rounded-l border 0">
                <label className="rounded-md bg-slate-700 py-2 px-4 border border-transparent text-center text-white">Email List</label>
                <nav className="flex min-w-[240px] flex-col gap-1 p-1.5">
                    {emails.length != 0 ? displayEmails() : <div>No emails added</div>}
                </nav>
            </div>
        </div>
    </div>
  );
}

export default VolunteerAccountCreation;