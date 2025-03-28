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

  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    // Find all UserShifts for this user in the last 6 months
    const userShifts = await UserShiftModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      shiftDate: { $gte: sixMonthsAgo },
    })
      .populate({
        path: "routeId",
        select: "routeName",
      })
      .sort({ shiftDate: -1 })
      .lean();

    if (!userShifts || userShifts.length === 0) {
      console.log(`No shifts found for user ${userId} in the last 6 months`);
      return [];
    }

    // Create a map to store unique routes with their most recent date
    const routeMap = new Map<string, UserRoute>();

    userShifts.forEach((shift) => {
      const routeId = (shift.routeId as any)._id.toString();
      const routeName = (shift.routeId as any).routeName || "Unknown Route";
      const shiftDate = new Date(shift.shiftDate);

      // Format the date as MM-DD-YY
      const formattedDate = shiftDate
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, "-");

      // Only add if this route isn't already in our map (since we sorted by date desc)
      if (!routeMap.has(routeId)) {
        routeMap.set(routeId, {
          name: routeName,
          date: formattedDate,
        });
      }
    });

    // Return array of unique routes
    return Array.from(routeMap.values());
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

/**
 * Fallback function to get mock routes data
 * @returns Array of mock route data
 */
export async function getMockUserRoutes(): Promise<UserRoute[]> {
  return [
    { name: "1. Goldberg's WPF + The Tower", date: "10-03-23" },
    { name: "2. Emerald City Bagels", date: "10-01-23" },
    { name: "3. Henri's Brookhaven", date: "09-02-23" },
    { name: "4. Bagel Palace", date: "08-15-23" },
    { name: "5. Brooklyn Bagel Bakery", date: "08-05-23" },
    { name: "6. Hometown Bagels + Cafe", date: "07-22-23" },
    { name: "7. Westside Bagel Company", date: "07-14-23" },
    { name: "8. The Bagel Bin", date: "06-30-23" },
    { name: "9. Rising Bagel Co.", date: "06-18-23" },
    { name: "10. Sunrise Bagels & Deli", date: "06-02-23" },
    { name: "11. Midtown Bagel Shop", date: "05-27-23" },
    { name: "12. Bagelicious Express", date: "05-15-23" },
    { name: "13. Uptown Bagel & Brew", date: "05-03-23" },
    { name: "14. The Bagel Project", date: "04-22-23" },
    { name: "15. Circle City Bagels", date: "04-10-23" },
    { name: "16. Morning Glory Bakery", date: "03-28-23" },
    { name: "17. Old World Bagelry", date: "03-15-23" },
    { name: "18. Downtown Bagel Exchange", date: "03-02-23" }
  ];
}
