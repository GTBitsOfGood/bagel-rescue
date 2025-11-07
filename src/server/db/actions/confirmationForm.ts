"use server";

import { Types } from "mongoose";
import mongoose from "mongoose";
import dbConnect from "../dbConnect";
import { ConfirmationModel, Confirmation } from "../models/confirmationForm";
import { updateShiftConfirmation } from "./shift";
import { getUserShift, updateUserShiftStatus } from "./userShifts";
import { ObjectId } from "mongoose";


interface confirmationFormField {
  completed: boolean;
  numPickedUp: number;
  numDelivered: number,
  time: number;
  comments?: string;
}

export async function postConfirmationForm(date: string, userShift: string, form: confirmationFormField): Promise<void> {
  try {
    await dbConnect();
    const newConfirmationForm = new ConfirmationModel({
      completed: form.completed,
      bagelsPickedUp: form.numPickedUp,
      bagelsDelivered: form.numDelivered,
      minutes: form.time,
      comments: form.comments,
    })
    const savedConfirmation = await newConfirmationForm.save();
    const dateKey = date.slice(0, 10);
    
    if (form.completed) {
      await updateUserShiftStatus(userShift, "Complete");
    }

    const confirmationShift = await getUserShift(userShift);
    
    if (!confirmationShift?.shiftId || !savedConfirmation?._id) {
      console.error("Missing shiftId or confirmationId");
      return;
    }

    console.log(confirmationShift)
    await updateShiftConfirmation(
      confirmationShift.shiftId.toString(),
      dateKey,
      savedConfirmation._id.toString()
    );    

  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating confirmation form: ${err.message}`);
  }
}


export async function getConfirmationForm(formId: string | Types.ObjectId): Promise<Confirmation | null> {
  // await requireAdmin();
  try {
    await dbConnect();
    const objectId = typeof formId === "string" ? new mongoose.Types.ObjectId(formId) : formId;
    const data = await ConfirmationModel.findById(objectId).lean();
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when getting shift: ${err.message}`);
  }
}