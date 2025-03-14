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
 * This implementation uses the existing database schema.
 * 
 * @param userId The user's ID
 * @returns Array of unique routes with dates
 */
export async function getUserUniqueRoutes(userId: string | ObjectId): Promise<UserRoute[]> {
  await dbConnect();

  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    // Since we don't have a direct relationship model between users and shifts,
    // we'll need to infer it from the data we have.
    
    // Step 1: Get all shifts from the last 6 months
    // Ideally, we would filter by shifts the user participated in, but without a join table,
    // we'll need to get all shifts and filter them later
    const shifts = await ShiftModel.find({
      shiftDate: { $gte: sixMonthsAgo }
    }).lean();

    if (!shifts || shifts.length === 0) {
      console.log("No shifts found in the last 6 months");
      return [];
    }

    // Step 2: Get route details for these shifts
    const routeIds = [...new Set(shifts.map(shift => shift.routeId.toString()))];
    const routes = await Route.find({
      _id: { $in: routeIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();

    // Create a map of routeId to route name
    const routeNameMap = new Map<string, string>();
    routes.forEach(route => {
      routeNameMap.set(route._id.toString(), route.routeName);
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
    
    shifts.forEach(shift => {
      const routeId = shift.routeId.toString();
      const routeName = routeNameMap.get(routeId) || "Unknown Route";
      const shiftDate = new Date(shift.shiftDate);
      
      // Format the date as MM-DD-YY
      const formattedDate = shiftDate.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit'
      }).replace(/\//g, '-');
      
      // If this route isn't in our map yet, or this shift is more recent than what we have, update it
      if (!routeMap.has(routeId) || new Date(routeMap.get(routeId)!.date) < shiftDate) {
        routeMap.set(routeId, {
          name: routeName,
          date: formattedDate
        });
      }
    });

    // Step 5: Convert to array and sort by date (most recent first)
    return Array.from(routeMap.values())
      .sort((a, b) => {
        // Convert dates back to comparable format
        const dateA = new Date(a.date.split('-').reverse().join('-'));
        const dateB = new Date(b.date.split('-').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });
  } catch (error) {
    console.error('Error fetching user routes:', error);
    return [];
  }
}

/**
 * Fallback function to get mock routes data
 * @returns Array of mock route data
 */
export async function getMockUserRoutes(): Promise<UserRoute[]> {
  return [
    { name: "Goldberg's WPF + The Tower", date: "10-03-23" },
    { name: "Emerald City Bagels", date: "10-01-23" },
    { name: "Henri's Brookhaven", date: "09-02-20" },
    { name: "Bagel Palace", date: "08-15-20" },
    { name: "Brooklyn Bagel", date: "08-01-20" },
    { name: "Rise-n-Dine", date: "07-22-20" },
    { name: "BB's Bagels", date: "07-15-20" },
    { name: "Bagelicious", date: "07-01-20" },
    { name: "Art's Bagels & More", date: "06-28-20" },
    { name: "General Muir", date: "06-15-20" },
    { name: "Sunny's Bagels", date: "05-30-20" },
    { name: "Bagel Boys", date: "05-15-20" },
    { name: "Einstein Bros Bagels", date: "05-01-20" },
    { name: "New York Bagel", date: "04-20-20" },
    { name: "Village Bagel", date: "04-10-20" }
  ];
}