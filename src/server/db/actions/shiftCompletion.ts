'use server'

import mongoose from "mongoose";
import dbConnect from "../dbConnect";
import { ShiftModel } from "../models/shift";
import User from "../models/User";
import { requireUser } from "../auth/auth";
import { getCurrentUserId } from "./userShifts";
import { UserShiftModel } from "../models/userShift";

export interface ShiftFormValues {
    routeCompleted: string;
    delivered: number;
    pickedUp: number;
    minutes: number;
  }

export async function submitCompletionForm(data: ShiftFormValues, userId: string, shiftId: string): Promise<void> {
  await requireUser();
  try {
    await dbConnect();
    
    // Validate inputs
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid userId format");
    }
    if (!shiftId || !mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error("Invalid shiftId format");
    }
    
    // Validate form data
    if (typeof data.delivered !== "number" || data.delivered < 0) {
      throw new Error("delivered must be a non-negative number");
    }
    if (typeof data.pickedUp !== "number" || data.pickedUp < 0) {
      throw new Error("pickedUp must be a non-negative number");
    }
    if (typeof data.minutes !== "number" || data.minutes < 0) {
      throw new Error("minutes must be a non-negative number");
    }
    if (typeof data.routeCompleted !== "string") {
      throw new Error("routeCompleted must be a string");
    }
    
    // Get current user and verify authorization
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      throw new Error("User not authenticated");
    }
    
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }
    
    // Only allow users to submit forms for their own shifts, or admins to submit for any user
    if (currentUserId !== userId && !currentUser.isAdmin) {
      throw new Error("You do not have permission to submit this form");
    }
    
    // Verify the user is assigned to this shift
    const userShift = await UserShiftModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      shiftId: new mongoose.Types.ObjectId(shiftId)
    });
    
    if (!userShift && !currentUser.isAdmin) {
      throw new Error("User is not assigned to this shift");
    }

    const shift = await ShiftModel.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.bagelsDelivered += data.delivered;
    user.bagelsPickedUp += data.pickedUp;
    user.totalDeliveries += 1;
    user.shiftsCompleted.push({ shiftId, timeTakenToComplete: data.minutes });
    
    await user.save();

  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when submitting form: ${err.message}`);
  }
}