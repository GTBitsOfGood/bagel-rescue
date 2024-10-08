"use server";

import { ObjectId } from "mongoose";
import dbConnect from "../dbConnect";
import { RecurrenceModel, Shift, ShiftModel } from "../models/shift";
import { RRule } from "rrule";

export async function createShift(shiftObject: Shift): Promise<Shift> {
  try {
    await dbConnect();

    await shiftObject.save();
    return shiftObject;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating shift: ${err.message}`);
  }
}

export async function getShift(shiftId: ObjectId): Promise<Shift | null> {
  try {
    await dbConnect();

    const data = await ShiftModel.findById(shiftId);
    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when getting shift: ${err.message}`);
  }
}

export async function updateRoute(
  shiftId: ObjectId,
  routeId: ObjectId
): Promise<Shift | null> {
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
export async function updateDate(
  shiftId: ObjectId,
  newDate: Date
): Promise<Shift | null> {
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
  shiftId: ObjectId,
  newCapacity: number
): Promise<Shift | null> {
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
export async function updateRecurrenceRule(
  shiftId: ObjectId,
  newRule: string
): Promise<Shift | null> {
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
 *
 * If a shiftDate is provided and is validated against the recurrence rule, then currSignedUp is incremented for that specific recurrence.
 *
 * If capacity is reached for that specific date, then false is returned
 */
export async function newSignUp(
  shiftId: ObjectId,
  shiftDate?: Date
): Promise<boolean> {
  try {
    await dbConnect();

    const data = await getShift(shiftId);
    if (!data) {
      throw new Error("Shift does not exist");
    }

    if (shiftDate && data.recurrenceRule !== "") {
      return await recurrenceSignup(data, shiftDate);
    } else if (data.capacity > data.currSignedUp) {
      data.currSignedUp += 1;
      await ShiftModel.findByIdAndUpdate(shiftId, data);
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
*/
async function recurrenceSignup(
  data: Shift,
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
  return true;
}

export async function getAllShifts(): Promise<string | null> {
  try {
    await dbConnect();
    const shifts = await ShiftModel.find();
    return JSON.stringify(shifts);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting all shifts: ${err.message}`);
  }
}
