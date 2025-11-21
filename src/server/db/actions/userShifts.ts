"use server";

import mongoose, { Types } from "mongoose";
import dbConnect from "../dbConnect";
import { UserShiftModel, UserShift } from "../models/userShift";
import RouteModel, { IRoute } from "../models/Route";
import { ObjectId } from "mongodb";
import User from "../models/User";
import { requireUser, requireAdmin } from "../auth/auth";
import { Shift, ShiftModel } from "../models/shift";
import { getAllLocationsById } from "./location";
import { getDaysInRange } from '@/lib/dayHandler';
import { combineDateAndTime, dateToString } from "@/lib/dateHandler";
import { getShift } from "./shift";
import { cookies } from "next/headers";
import { adminAuth } from "../firebase/admin/firebaseAdmin";

export type UserRoute = {
  name: string;
  date: string;
};

export type UserShiftData = {
  id: string;
  routeName: string;
  area: string;
  startTime: Date;
  endTime: Date;
  confirmationForms: { [date: string] : string};
  occurrenceDate?: Date;
  canceledShifts?: string[];
  recurrenceDates?: string[];
  hasComment?: string[];
};

export type DetailedShiftData = {
  id: string;
  routeName: string;
  area: string;
  shiftStartTime: Date;
  shiftEndTime: Date;
  shiftStartDate: Date;
  shiftEndDate: Date;
  startTime: Date;
  endTime: Date;
  confirmationForm: {[date: string] : string};
  routeInfo: {
    routeName: string;
    locationDescription: string;
    additionalInfo: string;
    locations: string[];
  };
  recurrenceDates: string[];
  shiftId: string;
  routeId: string;
  additionalInfo: string;
  createdByUserId?: string;
  comments?: { [date: string] : string};
};

export type PaginatedResult = {
  shifts: UserShiftData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};



export async function deleteUserShift(userId: string, shiftId: string): Promise<void> {
  await requireUser();
  await dbConnect();

  try {
    await UserShiftModel.findOneAndDelete({
      userId: new mongoose.Types.ObjectId(userId),
      shiftId: new mongoose.Types.ObjectId(shiftId),
    });
  } catch (error) {
    console.error("Error deleting user shift:", error);
    throw new Error("Failed to delete user shift");
  }
}

/**
 * Gets the current user ID from Firebase session
 *
 * @returns The current user's MongoDB ID or null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // Get the auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get("authToken");
    
    if (!authToken) {
      console.warn("No auth token found in cookies");
      return null;
    }

    // Verify the token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(authToken.value);
    const userEmail = decodedToken.email;

    if (!userEmail) {
      console.warn("No email found in decoded token");
      return null;
    }

    // Connect to database and find the user by email
    await dbConnect();
    const mongoUser = await User.findOne({ email: userEmail }).lean();

    if (!mongoUser || !('_id' in mongoUser)) {
      console.warn(`No MongoDB user found for email: ${userEmail}`);
      return null;
    }

    // Return the MongoDB user ID as a string
    return (mongoUser._id as mongoose.Types.ObjectId).toString();
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Gets shifts for a user within a specific date range
 * 
 * @param userId The user's ID
 * @param startDate Start of date range
 * @param endDate End of date range
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns Paginated array of user shifts within date range
 */
export async function getUserShiftsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult> {
  await requireUser();
  await dbConnect();

  try {
    const skip = (page - 1) * limit;

    const startAbsDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endAbsDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

    // Get UserShift documents within date range
    const userShifts = await UserShiftModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [
        { 
          shiftDate: { $gte: startAbsDate, $lte: endAbsDate }
        },
        { 
          shiftEndDate: { $gte: startAbsDate, $lte: endAbsDate }
        },
        { 
          shiftDate: { $lte: startAbsDate },
          shiftEndDate: { $gte: endAbsDate }
        },
        {
          shiftDate: { $gte: startAbsDate },
          shiftEndDate: { $lte: endAbsDate }
        }
      ],
      recurrenceDates: { $in: getDaysInRange(startDate, endDate) }
    })
      .skip(skip)
      .limit(limit)
      .lean();

    userShifts.sort((a, b) => new Date(a.shiftDate).getTime() - new Date(b.shiftDate).getTime());
    
    // Get total count for pagination
    const total = await UserShiftModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      shiftDate: { $gte: startDate, $lte: endDate }
    });
    
    // Get unique route and shift IDs
    const routeIds = Array.from(new Set(userShifts.map(shift => shift.routeId)));
    const shiftIds = Array.from(new Set(userShifts.map(shift => shift.shiftId)));

    // Get route details
    const routes = await RouteModel.find({
      _id: { $in: routeIds }
    }).lean();

    // Get shift details for comments
    const shifts = await ShiftModel.find({
      _id: { $in: shiftIds }
    }).lean();

    // Create a map of route IDs to route details
    const routeMap = new Map();
    routes.forEach(route => {
      if (route._id) {
        const routeId = route._id.toString();
        routeMap.set(routeId, {
          routeName: route.routeName || "Unknown Route",
          locationDescription: route.locationDescription || ""
        });
      }
    });
    
    const shiftCommentsMap = new Map();
    shifts.forEach(shift => {
      if (shift._id) {
        const shiftId = shift._id.toString();
        shiftCommentsMap.set(shiftId, shift.comments || {});
      }
    });


    const transformedShifts = (await Promise.all(
      userShifts.map(async (usershift) => {
        const route = routeMap.get(usershift.routeId.toString()) || {
          routeName: "Unknown Route",
          locationDescription: ""
        };

        const shift = (await getShift(usershift.shiftId.toString()))?.toObject();
        if (!shift) {
          return null;
        }

        const confirmationForms: { [date: string]: string; } = {};
        shift?.confirmationForm.forEach((objectId: any, dateKey: any) => {
          confirmationForms[dateKey] = objectId.toString();
        });

        
        return {
          id: usershift._id.toString(),
          routeName: route.routeName,
          area: route.locationDescription,
          startTime: new Date(usershift.shiftDate),
          endTime: new Date(usershift.shiftEndDate),
          confirmationForms: confirmationForms,
          canceledShifts: usershift.canceledShifts,
          recurrenceDates: usershift.recurrenceDates,
          hasComment: Object.keys(shiftCommentsMap.get(usershift.shiftId.toString()))
        };
      })
    )).filter((shift) => shift !== null);
    
    return {
      shifts: transformedShifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching user shifts by date range:", error);
    throw new Error("Failed to fetch user shifts by date range");
  }
}

/**
 * Updates the status of a user shift
 * 
 * @param shiftId The user shift ID
 * @param status The new status
 * @returns The updated shift
 */
export async function updateUserShiftStatus(
  shiftId: string,
  status: "Complete" | "Incomplete"
): Promise<UserShift | null> {
  await requireUser();

  await dbConnect();
  
  try {
    const updatedShift = await UserShiftModel.findByIdAndUpdate(
      shiftId,
      { status },
      { new: true }
    );
    
    return updatedShift;
  } catch (error) {
    console.error("Error updating user shift status:", error);
    throw new Error("Failed to update user shift status");
  }
}

/**
 * Gets detailed information for a specific user shift
 * 
 * @param userShiftId The user shift's ID
 * @returns Detailed shift information including route and location details
 */
export async function getDetailedShiftInfo(userShiftId: string): Promise<DetailedShiftData | null> {
  await requireUser();
  await dbConnect();

  try {
    // Get the UserShift document
    const userShift = await UserShiftModel.findById(userShiftId).lean();
    if (!userShift) {
      throw new Error("User shift not found");
    }

    // Get the Route details
    const route = await RouteModel.findById(userShift.routeId).lean();
    if (!route) {
      throw new Error("Route not found");
    }

    // Get the original Shift details for recurrence rule
    const shift = (await getShift(userShift.shiftId))?.toObject();
    
    // Get location names
    let locationNames: string[] = [];
    if (route.locations && route.locations.length > 0) {
      try {
        const locationIds = route.locations.map(loc => loc.location.toString());
        const locationsData = await getAllLocationsById(locationIds);
        if (locationsData) {
          const parsedLocations = JSON.parse(locationsData);
          locationNames = parsedLocations.map((loc: any) => (loc.locationName + " - " + loc.area) || "Unknown Location");
        }
      } catch (error) {
        console.error("Error fetching location names:", error);
        locationNames = ["Location details unavailable"];
      }
    }

    const confirmationForms: { [date: string]: string; } = {};
    shift?.confirmationForm.forEach((objectId: any, dateKey: any) => {
      confirmationForms[dateKey] = objectId.toString();
    });

    return {
      id: userShift._id.toString(),
      routeName: route.routeName || "Unknown Route",
      area: route.locationDescription || "",
      shiftStartTime: shift?.shiftStartTime || new Date(),
      shiftEndTime: shift?.shiftEndTime || new Date(),
      shiftStartDate: shift?.shiftStartDate || new Date(),
      shiftEndDate: shift?.shiftEndDate || new Date(),
      startTime: userShift.shiftDate,
      endTime: userShift.shiftEndDate,
      confirmationForm: confirmationForms,
      routeInfo: {
        routeName: route.routeName || "Unknown Route",
        locationDescription: route.locationDescription || "",
        additionalInfo: route.additionalInfo || "",
        locations: locationNames
      },
      recurrenceDates: shift?.recurrenceDates || [],
      shiftId: userShift.shiftId.toString(),
      routeId: userShift.routeId.toString(),
      additionalInfo: shift?.additionalInfo || "",
      comments: shift?.comments || {}
    };
    
  } catch (error) {
    console.error("Error fetching detailed shift info:", error);
    throw new Error("Failed to fetch detailed shift info");
  }
}

export async function getDetailedOpenShiftInfo(shiftId: string): Promise<DetailedShiftData | null> {
  await requireUser();
  await dbConnect();

  try {
    const shift = (await getShift(shiftId))?.toObject();
    if (!shift) {
      throw new Error("Shift not found");
    }

    const route = await RouteModel.findById(shift.routeId).lean();
    if (!route) {
      throw new Error("Route not found");
    }

    let locationNames: string[] = [];
    if (route.locations && route.locations.length > 0) {
      try {
        const locationIds = route.locations.map(loc => loc.location.toString());
        const locationsData = await getAllLocationsById(locationIds);
        if (locationsData) {
          const parsedLocations = JSON.parse(locationsData);
          locationNames = parsedLocations.map((loc: any) => (loc.locationName + " - " + loc.area) || "Unknown Location");
        }
      } catch (error) {
        console.error("Error fetching location names:", error);
        locationNames = ["Location details unavaiable"];
      }
    }

    const confirmationForms: { [date: string]: string; } = {};
    shift?.confirmationForm.forEach((objectId: any, dateKey: any) => {
      confirmationForms[dateKey] = objectId.toString();
    });

    return {
      id: shift._id.toString(),
      routeName: route.routeName || "Unknown Route",
      area: route.locationDescription || "",
      shiftStartTime: shift.shiftStartTime || new Date(),
      shiftEndTime: shift.shiftEndTime || new Date(),
      shiftStartDate: shift.shiftStartDate || new Date(),
      shiftEndDate: shift.shiftEndDate || new Date(),
      startTime: shift.shiftStartDate || new Date(),
      endTime: shift.shiftEndDate || new Date(),
      confirmationForm: confirmationForms,
      routeInfo: {
        routeName: route.routeName || "Unknown Route",
        locationDescription: route.locationDescription || "",
        additionalInfo: route.additionalInfo || "",
        locations: locationNames
      },
      recurrenceDates: shift.recurrenceDates || [],
      comments: shift.comments || {},
      shiftId: shift._id.toString(),
      routeId: shift.routeId.toString(),
      additionalInfo: shift.additionalInfo || "",
      createdByUserId: shift.createdByUserId?.toString(),
    };
  } catch (error) {
    console.error("Error fetching detailed open shift info:", error);
    throw new Error("failed to fetch detailed open shift info");
  }
}

/**
 * Gets shifts for the currently logged-in user within a specific date range
 * 
 * @param startDate Start of date range
 * @param endDate End of date range
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns Paginated array of user shifts within date range
 */
export async function getCurrentUserShiftsByDateRange(
  startDate: Date,
  endDate: Date,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult> {
  await requireUser();
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.error("No authenticated user found");
    return {
      shifts: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0
      }
    };
  }
  
  return getUserShiftsByDateRange(userId, startDate, endDate, page, limit);
}

// Get unique routes for a user
// For Volunteer Analystics Page
export async function getUserUniqueRoutes(
  userId: string
): Promise<UserRoute[]> {
  await dbConnect();

  // Calculate date 6 months ago for filtering recent routes
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    
    const userShifts = await UserShiftModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      shiftDate: { $gte: sixMonthsAgo },
    })
    .sort({ shiftDate: -1 }) 
    .lean(); 

    if (!userShifts || userShifts.length === 0) {
      console.log(`No shifts found for user ${userId} in the last 6 months`);
      return [];
    }

    interface UserShiftDocument {
      routeId: mongoose.Types.ObjectId | string;
      shiftDate: Date | string;
    }

    // Type assert userShifts to have the expected structure
    const typedShifts = userShifts as UserShiftDocument[];

    const routeIdSet = new Set(typedShifts.map(shift => 
      shift.routeId ? shift.routeId.toString() : ''
    ).filter(id => id !== ''));
    const routeIds = Array.from(routeIdSet);
    
    interface RouteDocument {
      _id: mongoose.Types.ObjectId | string;
      routeName?: string;
    }
    
    const routes = await RouteModel.find({
      _id: { $in: routeIds.map(id => new mongoose.Types.ObjectId(id.toString())) }
    }).lean() as RouteDocument[];
    
    const routeMap = new Map<string, string>();
    routes.forEach(route => {
      if (route._id) {
        const routeId = route._id.toString();
        routeMap.set(routeId, route.routeName || "Unknown Route");
      }
    });

    const uniqueRoutes = new Map<string, UserRoute>();
    
    typedShifts.forEach((shift) => {
      if (shift.routeId) {
        const routeId = shift.routeId.toString();
        const routeName = routeMap.get(routeId) || "Unknown Route";
        
        if (shift.shiftDate) {
          const shiftDate = new Date(shift.shiftDate);
          
          // Format the date as MM-DD-YY
          const formattedDate = shiftDate
            .toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })
            .replace(/\//g, "-");
          
          if (!uniqueRoutes.has(routeId)) {
            uniqueRoutes.set(routeId, {
              name: routeName,
              date: formattedDate,
            });
          }
        }
      }
    });

    // Return the array of unique routes with their most recent dates
    return Array.from(uniqueRoutes.values());
  } catch (error) {
    console.error("Error fetching user routes:", error);
    return [];
  }
}
/**
 * Gets all open shifts (ones with status "open")
 */
export async function getOpenShifts(
  startDate: Date,
  endDate: Date,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult> {
  await requireUser();
  await dbConnect();

  try {
    const skip = (page - 1) * limit;

    // Find open shifts in date range
    const openShifts = await ShiftModel.find({
      status: "open",
      shiftStartDate: { $gte: startDate, $lte: endDate }
    })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ShiftModel.countDocuments({
      status: "open",
      shiftStartDate: { $gte: startDate, $lte: endDate }
    });

    const routeIds = openShifts.map(shift => shift.routeId);
    const routes = await RouteModel.find({
      _id: { $in: routeIds }
    }).lean();

    const routeMap = new Map();
    routes.forEach(route => {
      if (route._id) {
        routeMap.set(route._id.toString(), {
          routeName: route.routeName || "Unknown Route",
          locationDescription: route.locationDescription || ""
        });
      }
    });

    // transform to UserShiftData
    const transformedShifts = openShifts.map(shift => {
      const route = routeMap.get(shift.routeId.toString()) || {
        routeName: "Unknown Route",
        locationDescription: ""
      };

      return {
        id: shift._id.toString(),
        routeName: route.routeName,
        area: route.locationDescription,
        startTime: new Date(shift.shiftStartTime),
        endTime: new Date(shift.shiftEndTime),
        confirmationForms: {},
        status: "Incomplete" as const // open shifts are not yet completed
      };
    });

    return {
      shifts: transformedShifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching open shifts:", error);
    throw new Error("Failed to fetch open shifts");
  }
}

/**
 * Gets unique routes for the currently logged-in user
 *
 * @returns Array of unique routes for the current user
 */
export async function getCurrentUserUniqueRoutes(): Promise<UserRoute[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    console.error("No authenticated user found");
    return [];
  }

  return getUserUniqueRoutes(userId);
}


export async function getShiftUsers(shiftIds: string[]) {
  await dbConnect();

  const newShiftIds = shiftIds.map(id => new ObjectId(id));

  try {

    const results = await UserShiftModel.aggregate([
      { $match: { shiftId: { $in: newShiftIds } } },
      {
        $lookup: {
          from: "users",          
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }, // since each shift has exactly 1 user
      {
        $project: {
          _id: 0,
          shiftId: { $toString: "$shiftId" },   // 👈 convert to string
          userId: { $toString: "$user._id" },
          fullName: {
            $concat: ["$user.firstName", " ", "$user.lastName"]
          }
        }
      }
    ]);

    return results;
  } catch (error) {
    console.error("Error fetching shift users:", error);
    throw new Error("Failed to fetch shift users");
  }
}

export async function createUserShift(userShiftData: {
  userId: string;
  shiftId: string;
  routeId: string;
  recurrenceDates: string[];
  shiftDate: Date | string;
  shiftEndDate: Date | string;
}): Promise<string> {
  try {
    await dbConnect();
    
    const newUserShift = new UserShiftModel({
      userId: userShiftData.userId,
      shiftId: userShiftData.shiftId,
      routeId: userShiftData.routeId,
      recurrenceDates: userShiftData.recurrenceDates,
      shiftDate: userShiftData.shiftDate,
      shiftEndDate: userShiftData.shiftEndDate,
      status: "Incomplete",
      canceledShifts: [],
    });

    await newUserShift.save();
    return "UserShift created successfully";
  } catch (error) {
    console.error("Error creating UserShift:", error);
    throw error;
  }
}

/**
 * Request sub for a shift on a given date
 * 
 * 1. Adds date to shift's canceledShifts array
 * 2. Creates new shift with "open" status on given date
 * 
 * @param userShiftId the user that is requesting a sub
 * @param specificDate the date that is being requested for a sub
 * @returns message indicating success
 */
export async function requestSubForShift(
  userShiftId: string,
  specificDate: Date
): Promise<string> {
  await requireUser();
  await dbConnect();

  try {

    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // grab user shift
    const userShift = await UserShiftModel.findById(userShiftId);
    if (!userShift) {
      throw new Error("UserShift not found");
    }

    // get the actual shift
    const originalShift = await ShiftModel.findById(userShift.shiftId);
    if (!originalShift) {
      throw new Error("Original shift not found");
    }

    // add to canceledShifts array in original shift
    if (!originalShift.canceledShifts) {
      originalShift.canceledShifts = [];
    }

    // duplicate check
    const dateString = dateToString(specificDate);
    const alreadyCanceled = originalShift.canceledShifts.some(
      (date) => dateToString(new Date(date)) === dateString
    );

    if (!alreadyCanceled) {
      originalShift.canceledShifts.push(specificDate);
      await originalShift.save();
    }

    // update canceledShifts array in userShift
    userShift.canceledShifts.push(dateString);
    await userShift.save();

    // gets route for new shift
    const route = await RouteModel.findById(userShift.routeId).lean();
    if (!route) {
      throw new Error("Route not found");
    }

    const dayOfWeek = specificDate.toLocaleString('en-US', { weekday: 'short' }).toLowerCase().substring(0, 2);


    // new shift with "open" status
    const newOpenShift = new ShiftModel({
      routeId: userShift.routeId,
      status: "open",
      shiftStartTime: originalShift.shiftStartTime,
      shiftEndTime: originalShift.shiftEndTime,
      shiftStartDate: specificDate,
      shiftEndDate: specificDate,
      additionalInfo: originalShift.additionalInfo || "",
      recurrenceDates: [dayOfWeek], // just the day the request is made on, not the whole pattern
      timeSpecific: originalShift.timeSpecific || false,
      confirmationForm: {},
      canceledShifts: [],
      comments: originalShift.comments || {},
      creationDate: new Date(),
      capacity: originalShift.capacity,
      currSignedUp: 0, // resets to 0 since shift is open
      recurrenceRule: originalShift.recurrenceRule || "",
      recurrences: [],
      createdByUserId: new mongoose.Types.ObjectId(userId), // track who created sub request
      parentShiftId: userShift.shiftId, // gets original shift in case undo
    });

    await newOpenShift.save();

    return "Sub requested successfully";
  } catch (error) {
    console.error("Error requesting sub:", error);
    throw new Error("Failed to request sub");
  }
}

/**
 * Pick up open shift
 * 
 * 1. Gets current user
 * 2. Creates new UserShift that links user to the new shift
 * 3. Updates shift status from "open" to "assigned"
 * 
 * @param shiftId the shift to pick up
 * @returns message if successful
 */
export async function pickUpShift(shiftId: string): Promise<string> {
  await requireUser();
  await dbConnect();

  try {
    // get user id
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // get the shift
    const shift = await ShiftModel.findById(shiftId);
    if (!shift) {
      throw new Error("Shift not found");
    }

    // see if shift is really open
    if (shift.status !== "open") {
      throw new Error("This shift is not available to pick up");
    }
    // make sure user doesn't have the shift already to prevent duplicates
    const existingUserShift = await UserShiftModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      shiftId: shift._id,
      shiftDate: shift.shiftStartDate
    });

    if (existingUserShift) {
      throw new Error("You have already picked up this shift");
    }

    // new UserShift creation
    const newUserShift = new UserShiftModel({
      userId: new mongoose.Types.ObjectId(userId),
      shiftId: shift._id,
      routeId: shift.routeId,
      recurrenceDates: shift.recurrenceDates || [],
      shiftDate: combineDateAndTime(shift.shiftStartDate, shift.shiftStartTime),
      shiftEndDate: combineDateAndTime(shift.shiftEndDate, shift.shiftEndTime),
      status: "Incomplete",
      canceledShifts: [],
    });

    await newUserShift.save();

    // update status of shift to "assigned"
    shift.status = "assigned";
    shift.currSignedUp = (shift.currSignedUp || 0) + 1;
    await shift.save();

    return "Shift pickup successful";
  } catch (error) {
    console.error("Error picking up shift:", error);
    if (error instanceof Error) {
      throw error; 
    }
    throw new Error("Failed to pick up shift");
  }
}

/**
 * Requests sub for current user's shift
 * 
 * @param userShiftId the user making the sub request
 * @param specificDate the date to request a sub for
 * @returns message if successful
 */
export async function requestSubForCurrentUserShift(
  userShiftId: string,
  specificDate: Date
): Promise<string> {
  await requireUser();

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("No authenticated user found");
  }

  // make sure UserShift is current user's 
  const userShift = await UserShiftModel.findById(userShiftId).lean();
  if (!userShift) {
    throw new Error("Shift not found");
  }

  if (userShift.userId.toString() !== userId) {
    throw new Error("You can only request subs for your own shifts");
  }

  return requestSubForShift(userShiftId, specificDate);

}

/**
 * Undo a sub request by recreating usershift and removig open shift
 * 
 * @param openShiftId the open shift id to undo
 * @returns message if successful
 */
export async function undoSubRequest(openShiftId: string): Promise<string> {
  await requireUser();
  await dbConnect();

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error("No authenticated user found");
    }

    // Get the open shift
    const openShift = await ShiftModel.findById(openShiftId);
    if (!openShift) {
      throw new Error("Open shift not found");
    }

    // grab user shift
    const userShift = await UserShiftModel.findOne({
      shiftId: openShift.parentShiftId,
      userId: new mongoose.Types.ObjectId(userId)
    })
    if (!userShift) {
      throw new Error("User shift not found");
    }

    // make sure this user created it (only they can undo)
    if (!openShift.createdByUserId || openShift.createdByUserId.toString() !== userId) {
      throw new Error("You can only undo your own sub requests");
    }

    if (openShift.status !== "open") {
      throw new Error("This shift is not an open shift");
    }
    
    // remove canceledShift from UserShift
    userShift.canceledShifts = userShift.canceledShifts.filter(shift => shift !== dateToString(openShift.shiftStartDate));
    await userShift.save();

    // get the parent shift ID (the original shift this was created from)
    const parentShiftId = openShift.parentShiftId || openShift._id;

    const parentShift = await ShiftModel.findById(parentShiftId);
    if (parentShift && parentShift.canceledShifts) {
      // Remove this date from canceledShifts
      const dateToRemove = dateToString(openShift.shiftStartDate);
      parentShift.canceledShifts = parentShift.canceledShifts.filter(
        (date) => dateToString(new Date(date)) !== dateToRemove
      );
      await parentShift.save();
    }

    // deletes open shift
    await ShiftModel.findByIdAndDelete(openShiftId);

    return "Sub request undone successfully";
  } catch (error) {
    console.error("Error undoing sub request:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to undo sub request");
  }
}

export async function updateUserShiftsRoute(shiftId: string, newRouteId: string): Promise<void> {
  await requireAdmin();
  try {
    await dbConnect();
    
    await UserShiftModel.updateMany(
      { shiftId: shiftId },
      { $set: { routeId: newRouteId } }
    );
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error updating userShifts route: ${err.message}`);
  }
}

export async function getUserShift(shiftId: string | Types.ObjectId): Promise<UserShift | null> {
  await dbConnect();
  await requireUser();

  const userId = await getCurrentUserId();
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  try {
    const objectId = typeof shiftId === "string" ? new mongoose.Types.ObjectId(shiftId) : shiftId;
    const data = await UserShiftModel.findById(objectId);
    
    if (data?.userId.toString() !== userId && !user.isAdmin) {
      throw new Error("You do not have access to this user shift");
    }

    return data;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when getting user shift: ${err.message}`);
  }
}
