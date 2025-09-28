"use server";

import mongoose from "mongoose";
import dbConnect from "../dbConnect";
import { UserShiftModel, UserShift } from "../models/userShift";
import Route from "../models/Route";
import { ObjectId } from "mongodb";

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
  status: "Complete" | "Incomplete";
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

/**
 * Gets the current user ID from Firebase session
 * NOTE: This is a placeholder for the actual Firebase implementation
 *
 * @returns The current user's ID or null if not authenticated
 */
async function getCurrentUserId(): Promise<string | null> {
  // This will be implemented once Firebase is set up
  // Example implementation:
  // const auth = getAuth(getFirebaseApp());
  // const user = auth.currentUser;
  // return user?.uid || null;

  // For now, return a placeholder value
  console.warn("getCurrentUserId is not implemented yet. Using placeholder.");
  return "507f1f77bcf86cd799439011"; // Test user ID from sample data
  // return "placeholder-user-id";
}

/**
 * Gets all shifts assigned to a user
 * 
 * @param userId The user's ID
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns Paginated array of user shifts
 */
export async function getUserShifts(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult> {
  await dbConnect();
  
  try {
    const skip = (page - 1) * limit;
    
    // Get UserShift documents
    const userShifts = await UserShiftModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ shiftDate: 1 })  // Sort by shiftDate ascending
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await UserShiftModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
    
    // Get unique route IDs
    const routeIds = Array.from(new Set(userShifts.map(shift => shift.routeId)));
    
    // Get route details
    const routes = await Route.find({
      _id: { $in: routeIds }
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
    
    // Transform the data for the frontend
    const transformedShifts = userShifts.map(shift => {
      const route = routeMap.get(shift.routeId.toString()) || {
        routeName: "Unknown Route",
        locationDescription: ""
      };
      
      return {
        id: shift._id.toString(),
        routeName: route.routeName,
        area: route.locationDescription,
        startTime: new Date(shift.shiftDate),
        endTime: new Date(shift.shiftEndDate),
        status: shift.status || "Incomplete"
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
    console.error("Error fetching user shifts:", error);
    throw new Error("Failed to fetch user shifts");
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
  await dbConnect();
  
  try {
    const skip = (page - 1) * limit;
    
    // Get UserShift documents within date range
    const userShifts = await UserShiftModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      shiftDate: { $gte: startDate, $lte: endDate }
    })
      .sort({ shiftDate: 1 })  // Sort by shiftDate ascending
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await UserShiftModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      shiftDate: { $gte: startDate, $lte: endDate }
    });
    
    // Get unique route IDs
    const routeIds = Array.from(new Set(userShifts.map(shift => shift.routeId)));
    
    // Get route details
    const routes = await Route.find({
      _id: { $in: routeIds }
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
    
    // Transform the data for the frontend
    const transformedShifts = userShifts.map(shift => {
      const route = routeMap.get(shift.routeId.toString()) || {
        routeName: "Unknown Route",
        locationDescription: ""
      };
      
      return {
        id: shift._id.toString(),
        routeName: route.routeName,
        area: route.locationDescription,
        startTime: new Date(shift.shiftDate),
        endTime: new Date(shift.shiftEndDate),
        status: shift.status || "Incomplete"
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
 * Gets shifts for the currently logged-in user
 * 
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns Paginated array of user shifts
 */
export async function getCurrentUserShifts(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResult> {
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
  
  return getUserShifts(userId, page, limit);
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
    
    const routes = await Route.find({
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

export async function createUserShift(userShiftData: {
  userId: string;
  shiftId: string;
  routeId: string;
  shiftDate: Date;
  shiftEndDate: Date;
}): Promise<string> {
  try {
    await dbConnect();
    
    const newUserShift = new UserShiftModel({
      userId: userShiftData.userId,
      shiftId: userShiftData.shiftId,
      routeId: userShiftData.routeId,
      shiftDate: userShiftData.shiftDate,
      shiftEndDate: userShiftData.shiftEndDate,
      status: "Incomplete"
    });

    await newUserShift.save();
    return "UserShift created successfully";
  } catch (error) {
    console.error("Error creating UserShift:", error);
    throw error;
  }
}