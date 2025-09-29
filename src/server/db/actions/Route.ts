"use server";

import { ObjectId } from "mongodb";
import Route, { ILocation, IRoute } from "../models/Route";
import dbConnect from "../dbConnect";
import { requireUser, requireAdmin } from "../auth/auth";

export async function getRoute(id: string): Promise<IRoute | null> {
  await requireAdmin();
  try {
    return await Route.findById(id);
  } catch (error) {
    console.error("Error fetching route:", error);
    throw new Error("Failed to fetch route");
  }
}

export async function createRoute(route: string): Promise<string | null> {
  try {
    await requireAdmin();
    await dbConnect();
    const newRoute = new Route(JSON.parse(route || "{}"));
    return JSON.stringify(await newRoute.save());
  } catch (error) {
    console.error("Error creating route:", error);
    throw new Error("Failed to create route");
  }
}

export async function updateRouteName(
  id: string,
  newRouteName: string
): Promise<IRoute | null> {
  try {
    await requireAdmin();
    return await Route.findByIdAndUpdate(
      id,
      { routeName: newRouteName },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating route name:", error);
    throw new Error("Failed to update route name");
  }
}

export async function getLocations(id: string): Promise<ILocation[] | null> {
  try {
    await requireAdmin();
    const route = await Route.findById(id);
    return route ? route.locations : null;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw new Error("Failed to fetch locations");
  }
}

export async function addLocation(
  id: string,
  locationId: string,
  index: number
): Promise<IRoute | null> {
  try {
    const route = await Route.findById(id);
    if (!route) return null;

    const newLocation: ILocation = {
      location: new ObjectId(locationId),
      type: "pickup", // Default to pickup, you may want to make this configurable
    };

    route.locations.splice(index, 0, newLocation);
    return await route.save();
  } catch (error) {
    console.error("Error adding location:", error);
    throw new Error("Failed to add location");
  }
}

export async function removeLocation(
  id: string,
  index: number
): Promise<IRoute | null> {
  try {
    const route = await Route.findById(id);
    if (!route) return null;

    route.locations.splice(index, 1);
    return await route.save();
  } catch (error) {
    console.error("Error removing location:", error);
    throw new Error("Failed to remove location");
  }
}

export async function getAllRoutes(): Promise<string | null> {
  try {
    await requireAdmin();
    await dbConnect();
    const routes = await Route.find();
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
    const data = await Route.find({_id: {$in: routeIds}});
    return JSON.stringify(data);
  } catch (error) {
      const err = error as Error;
      throw new Error(`Error has occurred when getting all routes: ${err.message}`);
  }
}
