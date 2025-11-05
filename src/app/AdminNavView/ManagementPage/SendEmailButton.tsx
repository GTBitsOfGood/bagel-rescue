"use client";

import { sendVolunteerSignupEmail } from "@/server/db/actions/email";
import { getUser } from "@/server/db/actions/User";
import { IUser } from "@/server/db/models/User";

interface SendEmailButtonProps {
  userId: string;
}

const SendEmailButton = ({ userId }: SendEmailButtonProps) => {
  const handleSendEmail = async () => {
    try {
      console.log(userId);
      const user = (await getUser(userId)) as IUser;
      console.log(user);
      await sendVolunteerSignupEmail(user?.email, user?.firstName);
    } catch (err) {
      console.error("Failed to fetch user with id ", userId, err);
    }
  };

  return (
    <button
      className="bg-[#0F7AFF] text-[#FFFFFF] font-[700] w-[150px] py-[10px] rounded-xl hover:bg-[#005bb5] cursor-pointer"
      onClick={() => handleSendEmail()}
    >
      Send Email
    </button>
  );
};

export default SendEmailButton;
