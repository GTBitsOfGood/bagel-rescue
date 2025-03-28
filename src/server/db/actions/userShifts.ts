"use server";

import dbConnect from "../dbConnect";
import { UserShiftModel } from "../models/userShift";
import mongoose from "mongoose";

export type UserRoute = {
  name: string;
  date: string;
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
  return "placeholder-user-id";
}

/**
 * Gets all unique routes for a user within the last 6 months
 *
 * @param userId The user's ID
 * @returns Array of unique routes with their most recent dates
 */
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
    
    const routes = await mongoose.model('Route').find({
      _id: { $in: routeIds.map(id => new mongoose.Types.ObjectId(id)) }
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

