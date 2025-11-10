"use client";

import { sendVolunteerSignupEmail } from "@/server/db/actions/email";

export default async (userId: string) => {
    try {
      return await sendVolunteerSignupEmail(userId);
    } catch (err) {
      console.error("Failed to fetch user with id ", userId, err);
      return false;
    }
  };