"use server";

import { ObjectId } from "mongoose";
import { RRule } from "rrule";
import dbConnect from "../dbConnect";
import { RecurrenceModel, Shift, ShiftModel } from "../models/shift";
import { UserShiftModel } from "../models/userShift";
import { requireAdmin } from "../auth/auth";

export async function createShift(shiftObject: string): Promise<string | null> {
  await requireAdmin();
  try {
    await dbConnect();
    const newShift = new ShiftModel(JSON.parse(shiftObject || "{}"));
    return JSON.stringify(await newShift.save());
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating shift: ${err.message}`);
  }
}

export async function getShift(shiftId: ObjectId): Promise<Shift | null> {
  await requireAdmin();
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
  shiftId: ObjectId,
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
  shiftId: ObjectId,
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
  shiftId: ObjectId,
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

  try {
    await dbConnect();
    const shifts = await ShiftModel.aggregate([
    // 1. Filter by week (example: get shifts for a specific week)
    {
      $match: {
        shiftDate: {
          $gte: startDate,
          $lt: endDate
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
        from: "userShifts",
        localField: "_id",
        foreignField: "shiftId",
        as: "userShifts"
      }
    },
    
    // 4. Join with users to get volunteer details
    {
      $lookup: {
        from: "users",
        localField: "userShifts.userId",
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
        shiftDate: 1,
        shiftEndDate: 1,
        capacity: 1,
        currSignedUp: 1,
        routeName: "$route.routeName",
        routeId: "$route._id",
        locationDescription: "$route.locationDescription",
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
                  "$userShifts.status",
                  { $indexOfArray: ["$userShifts.userId", "$$volunteer._id"] }
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


  