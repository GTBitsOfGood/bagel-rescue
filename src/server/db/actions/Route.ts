"use server";

import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import RouteModel, { ILocation, IRoute } from "../models/Route";
import dbConnect from "../dbConnect";
import { requireUser, requireAdmin } from "../auth/auth";
import { UserShiftModel } from "../models/userShift";
import { ShiftModel } from "../models/shift";

export async function getRoute(id: string): Promise<IRoute | null> {
  await requireAdmin();
  try {
    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }
    
    return await RouteModel.findById(id).lean<IRoute>();
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching route:", err);
    throw new Error(`Failed to fetch route: ${err.message}`);
  }
}

// Validation helper for route data
function validateRouteData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid route data: must be an object");
  }

  // Validate required fields
  if (!data.routeName || typeof data.routeName !== "string" || data.routeName.trim() === "") {
    throw new Error("Invalid route data: routeName is required and must be a non-empty string");
  }

  // Validate locationDescription if provided
  if (data.locationDescription !== undefined && typeof data.locationDescription !== "string") {
    throw new Error("Invalid route data: locationDescription must be a string");
  }

  // Validate additionalInfo if provided
  if (data.additionalInfo !== undefined && typeof data.additionalInfo !== "string") {
    throw new Error("Invalid route data: additionalInfo must be a string");
  }

  // Validate locations if provided
  if (data.locations !== undefined) {
    if (!Array.isArray(data.locations)) {
      throw new Error("Invalid route data: locations must be an array");
    }
    
    for (const loc of data.locations) {
      if (!loc || typeof loc !== "object") {
        throw new Error("Invalid route data: each location must be an object");
      }
      if (!loc.location || !mongoose.Types.ObjectId.isValid(loc.location)) {
        throw new Error("Invalid route data: location.location must be a valid ObjectId");
      }
      if (!loc.type || !["dropoff", "pickup"].includes(loc.type)) {
        throw new Error("Invalid route data: location.type must be 'dropoff' or 'pickup'");
      }
    }
  }
}

export async function createRoute(route: string): Promise<string | null> {
  try {
    await requireAdmin();
    await dbConnect();
    
    // Parse and validate the route data
    let parsedData;
    try {
      parsedData = JSON.parse(route || "{}");
    } catch (e) {
      throw new Error("Invalid JSON format for route data");
    }
    
    validateRouteData(parsedData);
    
    const newRoute = new RouteModel(parsedData);
    return JSON.stringify(await newRoute.save());
  } catch (error) {
    const err = error as Error;
    console.error("Error creating route:", err);
    throw new Error(`Failed to create route: ${err.message}`);
  }
}

export async function updateRouteName(
  id: string,
  newRouteName: string
): Promise<IRoute | null> {
  try {
    await requireAdmin();
    
    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }
    
    if (!newRouteName || typeof newRouteName !== "string" || newRouteName.trim() === "") {
      throw new Error("newRouteName must be a non-empty string");
    }
    
    return await RouteModel.findByIdAndUpdate(
      id,
      { routeName: newRouteName },
      { new: true }
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error updating route name:", err);
    throw new Error(`Failed to update route name: ${err.message}`);
  }
}

export async function getLocations(id: string): Promise<ILocation[] | null> {
  try {
    await requireAdmin();
    
    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }
    
    const route = await RouteModel.findById(id);
    return route ? route.locations : null;
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching locations:", err);
    throw new Error(`Failed to fetch locations: ${err.message}`);
  }
}

export async function addLocation(
  id: string,
  locationId: string,
  index: number
): Promise<IRoute | null> {
  try {
    await requireAdmin();
    
    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }
    
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      throw new Error("Invalid location ID format");
    }
    
    if (typeof index !== "number" || index < 0 || !Number.isInteger(index)) {
      throw new Error("index must be a non-negative integer");
    }
    
    const route = await RouteModel.findById(id);
    if (!route) {
      throw new Error("Route not found");
    }

    const newLocation: ILocation = {
      location: new ObjectId(locationId),
      type: "pickup", // Default to pickup, you may want to make this configurable
    };

    // Validate index is within bounds
    if (index > route.locations.length) {
      throw new Error("index is out of bounds");
    }

    route.locations.splice(index, 0, newLocation);
    return await route.save();
  } catch (error) {
    const err = error as Error;
    console.error("Error adding location:", err);
    throw new Error(`Failed to add location: ${err.message}`);
  }
}

export async function removeLocation(
  id: string,
  index: number
): Promise<IRoute | null> {
  try {
    await requireAdmin();
    
    // Validate inputs
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }
    
    if (typeof index !== "number" || index < 0 || !Number.isInteger(index)) {
      throw new Error("index must be a non-negative integer");
    }
    
    const route = await RouteModel.findById(id);
    if (!route) {
      throw new Error("Route not found");
    }

    // Validate index is within bounds
    if (index >= route.locations.length) {
      throw new Error("index is out of bounds");
    }

    route.locations.splice(index, 1);
    return await route.save();
  } catch (error) {
    const err = error as Error;
    console.error("Error removing location:", err);
    throw new Error(`Failed to remove location: ${err.message}`);
  }
}

export async function getAllRoutes(): Promise<string | null> {
  try {
    await requireAdmin();
    await dbConnect();
    const routes = await RouteModel.find();
    return JSON.stringify(routes);
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting all routes: ${err.message}`);
  }
}

export async function getAllRoutesbyIds(routeIds: ObjectId[]): Promise<string | null> {
  try {
    await requireAdmin();
    await dbConnect();
    const data = await RouteModel.find({_id: {$in: routeIds}});
    return JSON.stringify(data);
  } catch (error) {
      const err = error as Error;
      throw new Error(`Error has occurred when getting all routes: ${err.message}`);
  }
}

export async function getRoutesByShiftId(shiftId: string): Promise<IRoute[]> {
  try {
    await requireAdmin();
    await dbConnect();
    
    // Validate ObjectId format
    if (!shiftId || !mongoose.Types.ObjectId.isValid(shiftId)) {
      throw new Error("Invalid shift ID format");
    }
    
    const routes = await UserShiftModel.aggregate([
      {
        $match: { shiftId: new ObjectId(shiftId) } // filter by this shift
      },
      {
        $lookup: {
          from: "routes",           // the collection to join
          localField: "routeId",    // field in usershifts
          foreignField: "_id",      // field in routes
          as: "routeInfo"           // name for joined field
        }
      },
      {
        $unwind: "$routeInfo"       // flatten
      },
      {
        $replaceRoot: { newRoot: "$routeInfo" }  // return only route data
      }
    ]);
    return routes;
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching route by shift ID:", err);
    throw new Error(`Failed to fetch route by shift ID: ${err.message}`);
  }
}

export async function deleteRoute(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await requireAdmin();
    await dbConnect();

    // Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid route ID format");
    }

    const shiftCount = await ShiftModel.countDocuments({
      routeId: new ObjectId(id),
    });

    if (shiftCount > 0) {
      return {
        success: false,
        message: `Cannot delete route: ${shiftCount} shift(s) currently use this route.`,
      };
    }

    const deleted = await RouteModel.findByIdAndDelete(id);
    return {
      success: Boolean(deleted),
      message: deleted ? undefined : "Route not found.",
    };
  } catch (error) {
    const err = error as Error;
    return { success: false, message: `Failed to delete route: ${err.message}` };
  }
}
