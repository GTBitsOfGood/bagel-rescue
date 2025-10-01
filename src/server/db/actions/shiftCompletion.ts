'use server'

import dbConnect from "../dbConnect";
import { ShiftModel } from "../models/shift";
import User from "../models/User";
import { requireUser } from "../auth/auth";

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