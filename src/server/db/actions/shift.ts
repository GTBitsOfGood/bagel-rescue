"use server";

import { ObjectId } from "mongoose";
import mongoose from "mongoose";
import { RRule } from "rrule";
import dbConnect from "../dbConnect";
import { RecurrenceModel, Shift, ShiftModel } from "../models/shift";
import { UserShiftModel } from "../models/userShift";
import { requireAdmin, requireUser } from "../auth/auth";
import { Types } from "mongoose";
import { normalizeDate } from "@/lib/dateHandler";
import { getCurrentUserId } from "./userShifts";
import User from "../models/User";

// Validation helper for shift data
function validateShiftData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid shift data: must be an object");
  }

  // Validate required fields
  if (!data.routeId) {
    throw new Error("Invalid shift data: routeId is required");
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(data.routeId)) {
    throw new Error("Invalid shift data: routeId must be a valid ObjectId");
  }

  // Validate status if provided
  if (data.status && !["assigned", "open"].includes(data.status)) {
    throw new Error("Invalid shift data: status must be 'assigned' or 'open'");
  }

  // Validate dates
  if (data.shiftStartDate && isNaN(new Date(data.shiftStartDate).getTime())) {
    throw new Error("Invalid shift data: shiftStartDate must be a valid date");
  }
  if (data.shiftEndDate && isNaN(new Date(data.shiftEndDate).getTime())) {
    throw new Error("Invalid shift data: shiftEndDate must be a valid date");
  }
  if (data.shiftStartTime && isNaN(new Date(data.shiftStartTime).getTime())) {
    throw new Error("Invalid shift data: shiftStartTime must be a valid date");
  }
  if (data.shiftEndTime && isNaN(new Date(data.shiftEndTime).getTime())) {
    throw new Error("Invalid shift data: shiftEndTime must be a valid date");
  }

  // Validate capacity
  if (data.capacity !== undefined && (typeof data.capacity !== "number" || data.capacity < 0)) {
    throw new Error("Invalid shift data: capacity must be a non-negative number");
  }

  // Validate currSignedUp
  if (data.currSignedUp !== undefined && (typeof data.currSignedUp !== "number" || data.currSignedUp < 0)) {
    throw new Error("Invalid shift data: currSignedUp must be a non-negative number");
  }

  // Validate recurrenceDates if provided
  if (data.recurrenceDates && !Array.isArray(data.recurrenceDates)) {
    throw new Error("Invalid shift data: recurrenceDates must be an array");
  }

  // Validate recurrenceRule if provided
  if (data.recurrenceRule && typeof data.recurrenceRule === "string" && data.recurrenceRule !== "") {
    try {
      RRule.fromString(data.recurrenceRule);
    } catch (e) {
      throw new Error("Invalid shift data: recurrenceRule must be a valid RRule string");
    }
  }
}

export async function createShift(shiftObject: string): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    
    // Parse and validate the shift data
    let parsedData;
    try {
      parsedData = JSON.parse(shiftObject || "{}");
    } catch (e) {
      throw new Error("Invalid JSON format for shift data");
    }
    
    validateShiftData(parsedData);
    
    const newShift = new ShiftModel(parsedData);
    return JSON.stringify(await newShift.save());
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating shift: ${err.message}`);
  }
}

export async function getShift(shiftId: string | Types.ObjectId): Promise<Shift | null> {
  await requireUser();
  try {
    await dbConnect();
    
    // Validate ObjectId format
    const objectId = typeof shiftId === "string" ? new mongoose.Types.ObjectId(shiftId) : shiftId;
    if (!mongoose.Types.ObjectId.isValid(objectId.toString())) {
      throw new Error("Invalid shift ID format");
    }
    
    const data = await ShiftModel.findById(objectId);
    if (!data) {
      return null;
    }
    
    // Get current user to check permissions
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // If user is admin, allow access
    if (user.isAdmin) {
      return data;
    }
    
    // For non-admins, only allow access if user is assigned to this shift
    const userShift = await UserShiftModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      shiftId: objectId
    });
    
    if (!userShift) {
      throw new Error("You do not have permission to access this shift");
    }
    
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when getting shift: ${err.message}`);
  }
}

export async function deleteShift(shiftId: Types.ObjectId): Promise<void> {
  await requireAdmin();
  try {
    await dbConnect();
    await UserShiftModel.deleteMany({ shiftId });
    await ShiftModel.findByIdAndDelete(shiftId);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when deleting shift: ${err.message}`);
  }
}

export async function getShiftFromString(id: string) {
  return JSON.parse(JSON.stringify(await getShift(new mongoose.Types.ObjectId(id))));
}

export async function updateComment(data: string): Promise<any> {
  await requireAdmin(); 
  try {
    await dbConnect();

    // Parse and validate input
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      throw new Error("Invalid JSON format for comment data");
    }
    
    const { shiftId, date, comment } = parsed;
    
    if (!shiftId) {
      throw new Error("shiftId is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error("Invalid shiftId format");
    }
    
    if (!date || typeof date !== "string") {
      throw new Error("date must be a valid string");
    }
    
    if (comment !== undefined && typeof comment !== "string") {
      throw new Error("comment must be a string");
    }

    const foundShift = await ShiftModel.findById(shiftId);
    
    if (!foundShift) {
      throw new Error(`Shift not found with ID: ${shiftId}`);
    }
    
    const updateResult = await ShiftModel.updateOne(
      { _id: foundShift._id },
      { $set: { [`comments.${date}`]: comment } }
    );
    
    if (updateResult.matchedCount === 0) {
      throw new Error("Update failed - no document matched");
    }
    
    return null;
  } catch (error) {
    const err = error as Error;
    console.error("Error in updateComment:", err.message);
    throw new Error(`Error updating shift comment: ${err.message}`);
  }
}


export async function updateRoute(
  shiftId: ObjectId,
  routeId: ObjectId
): Promise<Shift | null> {
  await requireAdmin();
  try {
    await dbConnect();

    const data = await ShiftModel.findByIdAndUpdate(
      shiftId,
      { routeId: routeId },
      { new: true }
    );
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when updating route: ${err.message}`);
  }
}

/*
* Updates the date of a shift 

* If the shift has a recurrence rule, then the start date of the rule is 
* updated to the new date and all recurrences are updated accordingly.
* 
* Also changes the day of the week that the shift occurs on to the new date's day of the week
*/
/* 
TODO:
When a shift's date changes, all associated UserShift records need to be updated to reflect the new date
*/
export async function updateDate(
  shiftId: Types.ObjectId,
  newDate: Date
): Promise<Shift | null> {
  await requireAdmin();
  try {
    await dbConnect();

    const oldData = await getShift(shiftId);
    if (!oldData) {
      throw new Error("Shift does not exist");
    }

    if (oldData.recurrenceRule === "") {
      const data = await ShiftModel.findByIdAndUpdate(
        shiftId,
        { shiftDate: newDate },
        { new: true }
      );
      return data;
    }

    const dataDiff = newDate.getTime() - oldData.shiftDate.getTime();
    const newRecurrences = oldData.recurrences.map((recurrence) => {
      return new RecurrenceModel({
        date: new Date(recurrence.date.getTime() + dataDiff),
        capacity: recurrence.capacity,
        currSignedUp: recurrence.currSignedUp,
      });
    });

    const oldRule = RRule.fromString(oldData.recurrenceRule);
    const newRule = new RRule({
      ...oldRule.options,
      dtstart: newDate,
      byweekday: newDate.getDay(),
    });

    const data = await ShiftModel.findByIdAndUpdate(
      shiftId,
      {
        shiftDate: newDate,
        recurrences: newRecurrences,
        recurrenceRule: newRule.toString(),
      },
      { new: true }
    );
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when updating date: ${err.message}`);
  }
}

// updates the capacity of a shift and all its recurrences
export async function updateCapacity(
  shiftId: Types.ObjectId,
  newCapacity: number
): Promise<Shift | null> {
  await requireAdmin();
  try {
    await dbConnect();

    if (newCapacity < 0) {
      throw new Error("Capacity cannot be negative");
    }

    const data = await ShiftModel.findByIdAndUpdate(
      shiftId,
      { capacity: newCapacity, "recurrences.$[].capacity": newCapacity },
      { new: true }
    );
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(
      `Error has occurred when updating capacity: ${err.message}`
    );
  }
}

// updates the recurrence rule of a shift and clears all recurrences
/* TODO:
The current implementation clears all recurrences without handling existing UserShift records */
export async function updateRecurrenceRule(
  shiftId: ObjectId,
  newRule: string
): Promise<Shift | null> {
  await requireAdmin();
  try {
    await dbConnect();

    const data = await ShiftModel.findByIdAndUpdate(
      shiftId,
      { recurrenceRule: newRule, recurrences: [] },
      { new: true }
    );
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(
      `Error has occurred when updating recurrence rule: ${err.message}`
    );
  }
}

/*
 * Signs up a new user for a shift and updates the number of people signed up
 * If capacity is reached, then the user is not signed up and false is returned
 *
 * Creates a UserShift document to track user's signup
 *
 * If a shiftDate is provided and is validated against the recurrence rule, then currSignedUp is incremented for that specific recurrence.
 *
 * If capacity is reached for that specific date, then false is returned
 */
export async function newSignUp(
  shiftId: Types.ObjectId,
  userId: ObjectId,
  shiftDate?: Date
): Promise<boolean> {
  await requireAdmin();
  try {
    await dbConnect();

    const data = await getShift(shiftId);
    if (!data) {
      throw new Error("Shift does not exist");
    }

    if (shiftDate && data.recurrenceRule !== "") {
      return await recurrenceSignup(data, userId, shiftDate);
    } else if (data.capacity > data.currSignedUp) {
      data.currSignedUp += 1;
      await ShiftModel.findByIdAndUpdate(shiftId, data);
      
      // Create a new UserShift document
      const userShift = new UserShiftModel({
        userId: userId,
        shiftId: shiftId,
        routeId: data.routeId,
        shiftDate: data.shiftDate,
        shiftEndDate: data.shiftEndDate,
        status: "Incomplete"
      });
      await userShift.save();
      
      return true;
    }

    return false;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred for newSignUp: ${err.message}`);
  }
}

/* 
    Helper function for newSignUp

    Validates the shiftDate against the recurrence rule and signs up the user for that specific date
    Creates a UserShift document for the recurrence
*/
async function recurrenceSignup(
  data: Shift,
  userId: ObjectId,
  shiftDate: Date
): Promise<boolean> {
  const ocurrenceDate = RRule.fromString(data.recurrenceRule).after(
    shiftDate,
    true
  );
  if (
    !ocurrenceDate ||
    ocurrenceDate.getTime() !== shiftDate.getTime() ||
    data.shiftDate.getTime() === shiftDate.getTime()
  ) {
    return false;
  }

  const recurrences = data.recurrences.filter((recurrence) => {
    return recurrence.date.getTime() === shiftDate.getTime();
  });

  if (recurrences.length === 0) {
    data.recurrences.push(
      new RecurrenceModel({
        date: shiftDate,
        capacity: data.capacity,
        currSignedUp: 1,
      })
    );
  } else {
    if (recurrences[0].capacity <= recurrences[0].currSignedUp) {
      return false;
    }
    recurrences[0].currSignedUp += 1;
  }

  await ShiftModel.findByIdAndUpdate(data._id, data);
  
  const durationMs = data.shiftEndDate.getTime() - data.shiftDate.getTime();
  const endDate = new Date(shiftDate.getTime() + durationMs);
  
  const userShift = new UserShiftModel({
    userId: userId,
    shiftId: data._id,
    routeId: data.routeId,
    shiftDate: shiftDate,
    shiftEndDate: endDate,
    status: "Incomplete"
  });
  await userShift.save();
  
  return true;
}

export async function getAllShifts(): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    const shifts = await ShiftModel.find();
    return JSON.stringify(shifts);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting all shifts: ${err.message}`);
  }
}

export async function getShiftAnalytics(): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    const shifts = await ShiftModel.find();
    const monthlyShifts = new Map<string, number>();
    shifts.forEach((s) => {
      s.recurrences.forEach((r) => {
        const date = new Date(r.date);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString()}`;
        if (monthlyShifts.has(key)) {
          monthlyShifts.set(key, monthlyShifts.get(key)! + 1);
        } else {
          monthlyShifts.set(key, 1);
        }
      });
    });
    const today = new Date();
    const currMonth = `${today.getFullYear()}-${(
      today.getMonth() + 1
    ).toString()}`;
    const shiftsThisMonth = monthlyShifts.has(currMonth)
      ? monthlyShifts.get(currMonth)!
      : 0;
    monthlyShifts.delete(currMonth);

    let monthlyAvg = 0;
    monthlyShifts.forEach((value) => {
      monthlyAvg += value;
    });
    monthlyAvg /= monthlyShifts.size;

    return JSON.stringify({
      thisMonth: shiftsThisMonth,
      monthlyAverage: monthlyAvg,
    });
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting shift analytics: ${err.message}`);
  }
}

interface TempRecentShift {
  routeId: string;
  date: Date;
}

export async function getRecentShifts(
  numRecentShifts: number
): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    const shifts = await ShiftModel.find();
    const shiftRecurrences = shifts
      .flatMap((s: Shift) =>
        s.recurrences.map((r) => ({
          routeId: s.routeId.toString(),
          date: new Date(r.date),
        }))
      )
      .sort(
        (a: TempRecentShift, b: TempRecentShift) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, numRecentShifts);
    return JSON.stringify(shiftRecurrences);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting all shifts: ${err.message}`);
  }
}

export async function getShiftsByWeek(
  startDate: Date,
  endDate: Date
): Promise<string | null> {
  await requireAdmin();

  startDate = normalizeDate(startDate);
  endDate = normalizeDate(endDate);

  try {
    await dbConnect();
    const shifts = await ShiftModel.aggregate([
    // 1. Filter by week (example: get shifts for a specific week)
    {
      $match: {
        $expr: {
          $or: [
            {
              $and: [
                { $lte: ["$shiftStartDate", endDate] },     // shift starts before the week ends
                { $gte: ["$shiftEndDate", startDate] } // shift ends after the week starts
              ]
            },
            {
              $and: [
                { $lte: ["$shiftEndDate", endDate] },     // shift ends before the week ends
                { $gte: ["$shiftEndDate", startDate] } // shift starts after the week starts
              ]
            },
            {
              $and: [
                { $lte: ["$shiftStartDate", endDate] },     // shift ends before the week ends
                { $gte: ["$shiftStartDate", startDate] } // shift starts after the week starts
              ]
            }
          ]
      }
    }
    },
    
    // 2. Join with routes to get route information
    {
      $lookup: {
        from: "routes",
        localField: "routeId",
        foreignField: "_id",
        as: "route"
      }
    },
    { $unwind: { path: "$route", preserveNullAndEmptyArrays: true } },
    
    // 3. Join with userShifts to get volunteers for this shift
    {
      $lookup: {
        from: "usershifts",
        localField: "_id",
        foreignField: "shiftId",
        as: "usershifts"
      }
    },
    
    // 4. Join with users to get volunteer details
    {
      $lookup: {
        from: "users",
        localField: "usershifts.userId",
        foreignField: "_id",
        as: "volunteers"
      }
    },
    
    // 5. Project only the fields you need for the dashboard
    {
      $project: {
        shiftStartTime: 1,
        shiftEndTime: 1,
        recurrenceDates: 1,
        shiftStartDate: 1,
        shiftEndDate: 1,
        capacity: 1,
        currSignedUp: 1,
        additionalInfo: 1,
        canceledShifts: 1,
        status: 1,
        routeName: "$route.routeName",
        routeId: "$route._id",
        locationDescription: "$route.locationDescription",
        confirmationForm: 1,
        comments: 1,
        volunteers: {
          $map: {
            input: "$volunteers",
            as: "volunteer",
            in: {
              userId: "$$volunteer._id",
              firstName: "$$volunteer.firstName",
              lastName: "$$volunteer.lastName",
              email: "$$volunteer.email",
              status: {
                $arrayElemAt: [
                  "$usershifts.status",
                  { $indexOfArray: ["$usershifts.userId", "$$volunteer._id"] }
                ]
              }
            }
          }
        }
      }
    },
    
    // 6. Sort by shift date
    { $sort: { shiftDate: 1 } }
]);

return JSON.stringify(shifts);

} catch (error) {
    const err = error as Error;
    throw new Error(`Error getting shifts by week: ${err.message}`);
  }
}

export async function updateShift(shiftId: string, shiftUpdatePayload: string): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    
    // Validate shiftId
    if (!shiftId || !mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error("Invalid shiftId format");
    }
    
    // Parse and validate update data
    let updateData;
    try {
      updateData = JSON.parse(shiftUpdatePayload);
    } catch (e) {
      throw new Error("Invalid JSON format for shift update data");
    }
    
    // Validate ObjectId if routeId is provided
    if (updateData.routeId && !mongoose.Types.ObjectId.isValid(updateData.routeId)) {
      throw new Error("Invalid routeId format");
    }
    
    // Validate dates if provided
    if (updateData.shiftStartDate && isNaN(new Date(updateData.shiftStartDate).getTime())) {
      throw new Error("Invalid shiftStartDate");
    }
    if (updateData.shiftEndDate && isNaN(new Date(updateData.shiftEndDate).getTime())) {
      throw new Error("Invalid shiftEndDate");
    }
    if (updateData.shiftStartTime && isNaN(new Date(updateData.shiftStartTime).getTime())) {
      throw new Error("Invalid shiftStartTime");
    }
    if (updateData.shiftEndTime && isNaN(new Date(updateData.shiftEndTime).getTime())) {
      throw new Error("Invalid shiftEndTime");
    }
    
    // Validate currSignedUp if provided
    if (updateData.currSignedUp !== undefined && (typeof updateData.currSignedUp !== "number" || updateData.currSignedUp < 0)) {
      throw new Error("currSignedUp must be a non-negative number");
    }
    
    // Validate recurrenceDates if provided
    if (updateData.recurrenceDates !== undefined && !Array.isArray(updateData.recurrenceDates)) {
      throw new Error("recurrenceDates must be an array");
    }
    
    // Validate timeSpecific if provided
    if (updateData.timeSpecific !== undefined && typeof updateData.timeSpecific !== "boolean") {
      throw new Error("timeSpecific must be a boolean");
    }
    
    // Build update object with only provided fields
    const updateFields: any = {};
    if (updateData.routeId !== undefined) updateFields.routeId = updateData.routeId;
    if (updateData.shiftStartTime !== undefined) updateFields.shiftStartTime = updateData.shiftStartTime;
    if (updateData.shiftEndTime !== undefined) updateFields.shiftEndTime = updateData.shiftEndTime;
    if (updateData.shiftStartDate !== undefined) updateFields.shiftStartDate = updateData.shiftStartDate;
    if (updateData.shiftEndDate !== undefined) updateFields.shiftEndDate = updateData.shiftEndDate;
    if (updateData.recurrenceDates !== undefined) updateFields.recurrenceDates = updateData.recurrenceDates;
    if (updateData.timeSpecific !== undefined) updateFields.timeSpecific = updateData.timeSpecific;
    if (updateData.additionalInfo !== undefined) updateFields.additionalInfo = updateData.additionalInfo;
    if (updateData.currSignedUp !== undefined) updateFields.currSignedUp = updateData.currSignedUp;
    
    // Find and update the shift
    const updatedShift = await ShiftModel.findByIdAndUpdate(
      shiftId,
      { $set: updateFields },
      { new: true } // Return the updated document
    );

    if (!updatedShift) {
      throw new Error(`Shift not found with ID: ${shiftId}`);
    }

    return JSON.stringify(updatedShift);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error updating shift: ${err.message}`);
  }
}


export async function updateShiftConfirmation(
  shiftId: string,
  dateKey: string,
  confirmationId: string): Promise<boolean> {
  await requireUser();
  try {
    await dbConnect();
    
    // Validate inputs
    if (!shiftId || !mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error("Invalid shiftId format");
    }
    
    if (!dateKey || typeof dateKey !== "string") {
      throw new Error("dateKey must be a valid string");
    }
    
    if (!confirmationId || !mongoose.Types.ObjectId.isValid(confirmationId)) {
      throw new Error("Invalid confirmationId format");
    }

    // Get current user and verify authorization
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const result = await ShiftModel.findByIdAndUpdate(
      shiftId,
      { $set: { [`confirmationForm.${dateKey}`]: confirmationId } },
      { new: true, upsert: false }
    );

    if (!result) {
      throw new Error("Shift not found");
    }

    return true;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error updating shift confirmation: ${err.message}`);
  }
}
  
export async function getShiftsByDay(
  targetDate: Date
): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    
    // Set targetDate to start and end of day for comparison
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get day abbreviation (e.g., "Mo", "Tu", etc.)
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayAbbr = dayNames[targetDate.getDay()];
    
    const shifts = await ShiftModel.aggregate([
      // 1. Filter by day - check if shift occurs on the target date
      {
        $match: {
          $expr: {
            $or: [
              // For shifts with recurrenceDates, check if they occur on this day
              {
                $and: [
                  { $ne: [{ $size: { $ifNull: ["$recurrenceDates", []] } }, 0] },
                  { $in: [dayAbbr.toLowerCase(), { $map: { input: "$recurrenceDates", as: "day", in: { $toLower: "$$day" } } } ] },
                  { $lte: ["$shiftStartDate", endOfDay] },
                  { $gte: ["$shiftEndDate", startOfDay] }
                ]
              }
            ]
          }
        }
      },
      
      // 2. Join with routes to get route information
      {
        $lookup: {
          from: "routes",
          localField: "routeId",
          foreignField: "_id",
          as: "route"
        }
      },
      { $unwind: { path: "$route", preserveNullAndEmptyArrays: true } },
      
      // 3. Join with userShifts to get volunteers for this shift
      {
        $lookup: {
          from: "usershifts",
          localField: "_id",
          foreignField: "shiftId",
          as: "usershifts"
        }
      },
      
      // 4. Join with users to get volunteer details
      {
        $lookup: {
          from: "users",
          localField: "usershifts.userId",
          foreignField: "_id",
          as: "volunteers"
        }
      },
      
      // 5. Project only the fields you need for the dashboard
      {
        $project: {
          shiftStartTime: 1,
          shiftEndTime: 1,
          recurrenceDates: 1,
          shiftStartDate: 1,
          shiftEndDate: 1,
          canceledShifts: 1,
          capacity: 1,
          currSignedUp: 1,
          additionalInfo: 1,
          confirmationForm: 1,
          status: 1,
          routeName: "$route.routeName",
          routeId: "$route._id",
          locationDescription: "$route.locationDescription",
          comments: 1,
          volunteers: {
            $map: {
              input: "$volunteers",
              as: "volunteer",
              in: {
                userId: "$$volunteer._id",
                firstName: "$$volunteer.firstName",
                lastName: "$$volunteer.lastName",
                email: "$$volunteer.email",
                status: {
                  $arrayElemAt: [
                    "$usershifts.status",
                    { $indexOfArray: ["$usershifts.userId", "$$volunteer._id"] }
                  ]
                }
              }
            }
          }
        }
      },
      
      // 6. Sort by shift time
      { $sort: { shiftStartTime: 1 } }
    ]);

    return JSON.stringify(shifts);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting shifts by day: ${err.message}`);
  }
}
