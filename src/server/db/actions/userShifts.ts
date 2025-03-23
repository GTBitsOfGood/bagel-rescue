"use server";

import dbConnect from "../dbConnect";
import { ShiftModel } from "../models/shift";
import Route from "../models/Route";
import mongoose, { ObjectId } from "mongoose";

export type UserRoute = {
  name: string;
  date: string;
};

/**
 * Gets all unique routes from shifts for a specific user within the last 6 months
 *
 * @param userId The user's ID
 * @returns Array of unique routes with dates
 */
export async function getUserUniqueRoutes(
  userId: string | ObjectId
): Promise<UserRoute[]> {
  await dbConnect();

  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    // infer a relationship model between users and shifts

    // Step 1: Get all shifts from the last 6 months
    const shifts = await ShiftModel.find({
      shiftDate: { $gte: sixMonthsAgo },
    }).lean();

    if (!shifts || shifts.length === 0) {
      console.log("No shifts found in the last 6 months");
      return [];
    }

    // Step 2: Get route details for these shifts
    const routeIds = Array.from(
      new Set(shifts.map((shift) => shift.routeId.toString()))
    );

    const routes = await Route.find({
      _id: { $in: routeIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    // Create a map of routeId to route name
    const routeNameMap = new Map<string, string>();
    routes.forEach((route) => {
      routeNameMap.set((route._id as string).toString(), route.routeName);
    });

    // Step 3: For now, we'll assume the user participated in all these shifts
    // In a production environment, you would need a way to determine which shifts a user actually participated in
    // This could be done through:
    // - Adding a participants array to the Shift model
    // - Creating a ShiftSignup model to track this relationship
    // - Or some other domain-specific logic

    console.log(`WARNING: Without a direct relationship between users and shifts, 
      we're showing all shifts from the last 6 months as if the user participated in them. 
      This is not accurate and should be replaced with proper filtering once 
      a user-shift relationship is established in the database.`);

    // Step 4: Create unique routes with their most recent date
    const routeMap = new Map<string, UserRoute>();

    shifts.forEach((shift) => {
      const routeId = shift.routeId.toString();
      const routeName = routeNameMap.get(routeId) || "Unknown Route";
      const shiftDate = new Date(shift.shiftDate);

      // Format the date as MM-DD-YY
      const formattedDate = shiftDate
        .toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })
        .replace(/\//g, "-");

      // If this route isn't in our map yet, or this shift is more recent than what we have, update it
      if (
        !routeMap.has(routeId) ||
        new Date(routeMap.get(routeId)!.date) < shiftDate
      ) {
        routeMap.set(routeId, {
          name: routeName,
          date: formattedDate,
        });
      }
    });

    // Step 5: Convert to array and sort by date (most recent first)
    return Array.from(routeMap.values()).sort((a, b) => {
      // Convert dates back to comparable format
      const dateA = new Date(a.date.split("-").reverse().join("-"));
      const dateB = new Date(b.date.split("-").reverse().join("-"));
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error("Error fetching user routes:", error);
    return [];
  }
}

/**
 * Fallback function to get mock routes data
 * @returns Array of mock route data
 */
export async function getMockUserRoutes(): Promise<UserRoute[]> {
  return [
    { name: "1. Goldberg's WPF + The Tower", date: "10-03-23" },
    { name: "2. Emerald City Bagels", date: "10-01-23" },
    { name: "3. Henri's Brookhaven", date: "09-02-20" },
    { name: "4. Bagel Palace", date: "08-15-20" },
    { name: "5. Brooklyn Bagel", date: "08-01-20" },
    { name: "6. Rise-n-Dine", date: "07-22-20" },
    { name: "7. BB's Bagels", date: "07-15-20" },
    { name: "8. Bagelicious", date: "07-01-20" },
    { name: "9. Art's Bagels & More", date: "06-28-20" },
    { name: "10. General Muir", date: "06-15-20" },
    { name: "11. Sunny's Bagels", date: "05-30-20" },
    { name: "12. Bagel Boys", date: "05-15-20" },
    { name: "13. Einstein Bros Bagels", date: "05-01-20" },
    { name: "14. New York Bagel", date: "04-20-20" },
    { name: "15. The Bagel Hole", date: "04-10-20" },
    { name: "16. Gotham Bagels", date: "03-28-20" },
    { name: "17. Bagel Haven", date: "03-15-20" },
    { name: "18. Big Apple Bagels", date: "03-01-20" },
    { name: "19. The Daily Bagel", date: "02-18-20" },
    { name: "20. Classic Bagels & Deli", date: "02-05-20" },
    { name: "21. The Bagel Nook", date: "01-25-20" },
    { name: "22. Best Bagels in Town", date: "01-10-20" },
    { name: "23. Morning Glory Bagels", date: "12-20-19" },
    { name: "24. Broadway Bagels", date: "12-05-19" },
    { name: "25. The Bagel Bar", date: "11-22-19" },
    { name: "26. Bagel Bros Café", date: "11-10-19" },
    { name: "27. Rolling Dough Bagels", date: "10-30-19" },
    { name: "28. Westside Bagels", date: "10-15-19" },
    { name: "29. The Bagel Joint", date: "10-01-19" },
    { name: "30. Brooklyn Water Bagel", date: "09-20-19" },
  ];
}
