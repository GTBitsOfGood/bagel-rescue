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
    const emailList = currentEmail.split(',').map(email => email.trim()).filter(email => email);
    
    // Basic email validation for each email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const invalidEmails = emailList.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      alert(`The following emails are invalid: ${invalidEmails.join(', ')}`);
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
    <>
      <div className="flex flex-row justify-between p-9 border-b-[1px] border-b-[#D3D8DE]">
        <span className="text-[#072B68] mt-2 font-[700] text-4xl">Volunteer Management</span>
        <div className="flex gap-6">
          <div 
            className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] p-[.8rem] px-5 gap-2 rounded-xl hover:bg-[#005bb5] cursor-pointer"
            onClick={() => router.push('/AdminNavView/ManagementPage/AddNewVolunteer')}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-3" />
            <span>Add New Volunteer</span>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#072B68]">Add New Volunteer</h2>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="mb-4">
              <input 
                type="text"
                required
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md p-3 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" 
                placeholder="Emails, comma separated" 
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-[#0F7AFF] text-white font-semibold py-2 px-4 rounded hover:bg-[#005bb5]"
                onClick={inviteVolunteer}
                disabled={loading}
              >
                {loading ? "Sending..." : "Invite"}
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Sent invitation</h3>
              {emails.length === 0 ? (
                <p className="text-gray-700">No invitations sent yet</p>
              ) : (
                <div className="space-y-2">
                  {emails.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                      <span>{email}</span>
                      <button 
                        onClick={() => setEmails(emails.filter(e => e !== email))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagementBar;
