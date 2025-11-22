"use server";

import { Types } from "mongoose";
import mongoose from "mongoose";
import dbConnect from "../dbConnect";
import { ConfirmationModel, Confirmation } from "../models/confirmationForm";
import { updateShiftConfirmation } from "./shift";
import { getCurrentUserId, getUserShift, updateUserShiftStatus } from "./userShifts";
import { requireUser } from "../auth/auth";
import { UserShiftModel } from "../models/userShift";
import RouteModel from "../models/Route";
import User from "../models/User";
import { dateToString, normalizeDate, stringToDate } from "@/lib/dateHandler";
import { setMonthlyShifts } from "./User";


interface confirmationFormField {
  completed: boolean;
  numPickedUp: number;
  numDelivered: number,
  time: number;
  comments?: string;
}

export async function postConfirmationForm(date: string, userShift: string, form: confirmationFormField): Promise<void> {
  try {
    await requireUser();
    await dbConnect();

    // Check whether user has access to this userShift
    const userShiftModel = await UserShiftModel.findById(userShift);
    if (!userShiftModel || userShiftModel.userId.toString() !== (await getCurrentUserId())) {
      throw new Error("You do not have access to this user shift");
    }

    const route = await RouteModel.findById(userShiftModel.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const user = await User.findById(userShiftModel.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newConfirmationForm = new ConfirmationModel({
      completed: form.completed,
      bagelsPickedUp: form.numPickedUp,
      bagelsDelivered: form.numDelivered,
      minutes: form.time,
      comments: form.comments,
      routeName: route.routeName + " - " + route.locationDescription,
      volunteerName: user.firstName + " " + user.lastName,
      shiftDate: stringToDate(date),
      userId: userShiftModel.userId
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
    
    const monthlyShifts: Map<
            string,
            {
                shiftTime: number;
                bagelsDelivered: number;
                bagelsReceived: number;
                totalShifts: number;
            }
        > = user.monthlyShifts;

    let monthlyShfitDate: Date = stringToDate(date);
    monthlyShfitDate.setDate(1);
    monthlyShfitDate = normalizeDate(monthlyShfitDate);
    const monthlyShfitKey: string = dateToString(monthlyShfitDate);
    
    if (!monthlyShifts.has(monthlyShfitKey)) {
      monthlyShifts.set(monthlyShfitKey, {
        shiftTime: 0,
        bagelsDelivered: 0,
        bagelsReceived: 0,
        totalShifts: 0
      });
    }

    monthlyShifts.set(monthlyShfitKey, {
      shiftTime: monthlyShifts.get(monthlyShfitKey)!.shiftTime + form.time,
      bagelsDelivered: monthlyShifts.get(monthlyShfitKey)!.bagelsDelivered + form.numDelivered,
      bagelsReceived: monthlyShifts.get(monthlyShfitKey)!.bagelsReceived + form.numPickedUp,
      totalShifts: monthlyShifts.get(monthlyShfitKey)!.totalShifts + 1
    });

    setMonthlyShifts(user._id.toString(), monthlyShifts);

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
  await dbConnect();
  await requireUser();

  const userId = await getCurrentUserId();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const objectId = typeof formId === "string" ? new mongoose.Types.ObjectId(formId) : formId;
    const data = await ConfirmationModel.findById(objectId).lean();
    if (data?.userId.toString() !== userId && !user.isAdmin) {
      throw new Error("You do not have access to this confirmation form");
    }
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when getting shift: ${err.message}`);
  }
}