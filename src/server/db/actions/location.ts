"use server";

import mongoose from "mongoose";
import { LocationModel, Location, Address } from "../models/location";
import RouteModel from "../models/Route";
import dbConnect from "../dbConnect";
import { requireAdmin, requireUser } from "../auth/auth";
import { Types } from "mongoose";

// Validation helper for location data
function validateLocationData(data: any): void {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid location data: must be an object");
  }

  // Validate required fields
  if (!data.locationName || typeof data.locationName !== "string" || data.locationName.trim() === "") {
    throw new Error("Invalid location data: locationName is required and must be a non-empty string");
  }

  if (!data.area || typeof data.area !== "string" || data.area.trim() === "") {
    throw new Error("Invalid location data: area is required and must be a non-empty string");
  }

  if (!data.type || !["Pick-Up", "Drop-Off"].includes(data.type)) {
    throw new Error("Invalid location data: type must be 'Pick-Up' or 'Drop-Off'");
  }

  // Validate address
  if (!data.address || typeof data.address !== "object") {
    throw new Error("Invalid location data: address is required and must be an object");
  }

  const addr = data.address;
  if (!addr.street || typeof addr.street !== "string" || addr.street.trim() === "") {
    throw new Error("Invalid location data: address.street is required and must be a non-empty string");
  }
  if (!addr.city || typeof addr.city !== "string" || addr.city.trim() === "") {
    throw new Error("Invalid location data: address.city is required and must be a non-empty string");
  }
  if (!addr.state || typeof addr.state !== "string" || addr.state.trim() === "") {
    throw new Error("Invalid location data: address.state is required and must be a non-empty string");
  }
  if (typeof addr.zipCode !== "number" || addr.zipCode < 0 || !Number.isInteger(addr.zipCode)) {
    throw new Error("Invalid location data: address.zipCode must be a non-negative integer");
  }

  // Validate optional fields
  if (data.notes !== undefined && typeof data.notes !== "string") {
    throw new Error("Invalid location data: notes must be a string");
  }
  if (data.contact !== undefined && typeof data.contact !== "string") {
    throw new Error("Invalid location data: contact must be a string");
  }
  if (data.bags !== undefined && typeof data.bags !== "number" && data.bags !== "All Bags") {
    throw new Error("Invalid location data: bags must be a number or 'All Bags'");
  }
}

export async function createLocation(
    newLocation: string
): Promise<string | null> {
    await requireAdmin();
    await dbConnect();
    try {
        // Parse and validate the location data
        let parsedData;
        try {
            parsedData = JSON.parse(newLocation || "{}");
        } catch (e) {
            throw new Error("Invalid JSON format for location data");
        }
        
        validateLocationData(parsedData);
        
        const newLocationModel = new LocationModel(parsedData);
        return JSON.stringify(await newLocationModel.save());
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error creating location: ${err.message}`);
    }
}

export async function deleteLocation(
    id: string
): Promise<{ success: boolean; message?: string }> {
    await requireAdmin();
    await dbConnect();
    try {
        // Validate ObjectId format
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid location ID format");
        }
        
        const routesWithLocation = await RouteModel.find({
            "locations.location": new Types.ObjectId(id),
        });

        if (routesWithLocation.length > 0) {
            return {
                success: false,
                message: `Cannot delete location: it is referenced in ${
                    routesWithLocation.length
                } route(s): ${routesWithLocation.map(
                    (route) => route.routeName
                )}`,
            };
        }

        const result = await LocationModel.findByIdAndDelete(id);
        return { success: result !== null };
    } catch (error) {
        const err = error as Error;
        return { success: false, message: `Error deleting location: ${err.message}` };
    }
}

export async function getAllLocationsById(
    id: string[]
): Promise<string | null> {
    await requireUser();
    await dbConnect();
    try {
        // Validate input
        if (!Array.isArray(id)) {
            throw new Error("id must be an array");
        }
        
        // Validate all ObjectIds
        const validIds = id.filter(idStr => mongoose.Types.ObjectId.isValid(idStr));
        if (validIds.length === 0) {
            throw new Error("No valid location IDs provided");
        }
        
        const location = await LocationModel.find({ _id: { $in: validIds } });
        return JSON.stringify(location);
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error getting location by id: ${err.message}`);
    }
}

export async function updateLocationName(
    id: string,
    newLocationName: string
): Promise<Location | null> {
    await requireAdmin();
    await dbConnect();
    try {
        // Validate inputs
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid location ID format");
        }
        
        if (!newLocationName || typeof newLocationName !== "string" || newLocationName.trim() === "") {
            throw new Error("newLocationName must be a non-empty string");
        }
        
        const location = await LocationModel.findByIdAndUpdate(
            id,
            { locationName: newLocationName },
            { new: true }
        );
        
        if (!location) {
            throw new Error("Location not found");
        }
        
        return location;
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error updating location name: ${err.message}`);
    }
}

export async function updateNotes(
    id: string,
    newNote: string
): Promise<Location | null> {
    await requireAdmin();
    await dbConnect();
    try {
        // Validate inputs
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid location ID format");
        }
        
        if (typeof newNote !== "string") {
            throw new Error("newNote must be a string");
        }
        
        const location = await LocationModel.findByIdAndUpdate(
            id,
            { notes: newNote },
            { new: true }
        );
        
        if (!location) {
            throw new Error("Location not found");
        }
        
        return location;
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error updating notes: ${err.message}`);
    }
}

export async function updateAddress(
    id: string,
    newAddress: Address
): Promise<Location | null> {
    await requireAdmin();
    await dbConnect();
    try {
        // Validate inputs
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid location ID format");
        }
        
        if (!newAddress || typeof newAddress !== "object") {
            throw new Error("newAddress must be an object");
        }
        
        // Validate address fields
        if (!newAddress.street || typeof newAddress.street !== "string" || newAddress.street.trim() === "") {
            throw new Error("address.street is required and must be a non-empty string");
        }
        if (!newAddress.city || typeof newAddress.city !== "string" || newAddress.city.trim() === "") {
            throw new Error("address.city is required and must be a non-empty string");
        }
        if (!newAddress.state || typeof newAddress.state !== "string" || newAddress.state.trim() === "") {
            throw new Error("address.state is required and must be a non-empty string");
        }
        if (typeof newAddress.zipCode !== "number" || newAddress.zipCode < 0 || !Number.isInteger(newAddress.zipCode)) {
            throw new Error("address.zipCode must be a non-negative integer");
        }
        
        const location = await LocationModel.findByIdAndUpdate(
            id,
            { address: newAddress },
            { new: true }
        );
        
        if (!location) {
            throw new Error("Location not found");
        }
        
        return location;
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error updating address: ${err.message}`);
    }
}

export async function getAllLocations(): Promise<string | null> {
    await requireAdmin();
    try {
        await dbConnect();
        const locations = await LocationModel.find();
        return JSON.stringify(locations);
    } catch (error) {
        const err = error as Error;
        throw new Error(`Error getting all locations: ${err.message}`);
    }
}
