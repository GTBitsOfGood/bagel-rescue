'use server';

import { LocationModel, Location, Address } from "../models/location";
import dbConnect from "../dbConnect";
import { requireAdmin } from "../auth/auth";

export async function createLocation(newLocation: string): Promise<string | null> {
  await requireAdmin();
  await dbConnect();
  try {
    const newShift = new LocationModel(JSON.parse(newLocation || "{}"));
    return JSON.stringify(await newShift.save());
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error creating location: ${err.message}`);
  }
}

export async function getAllLocationsById(id: string[]): Promise<string | null> {
  // await requireAdmin();
  await dbConnect();
  try {
    const location = await LocationModel.find({_id: id});
    return JSON.stringify(location);
  }
  catch (error) {
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
    const location = await LocationModel.findByIdAndUpdate(
      id,
      { locationName: newLocationName },
      { new: true }
    );
    return location;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error creating location name: ${err.message}`);
  }
}

export async function updateNotes(
  id: string,
  newNote: string
): Promise<Location | null> {
  await requireAdmin();
  await dbConnect();
  try {
    const location = await LocationModel.findByIdAndUpdate(
      id,
      { notes: newNote },
      { new: true }
    );
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
    const location = await LocationModel.findByIdAndUpdate(
      id,
      { address: newAddress },
      { new: true }
    );
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
