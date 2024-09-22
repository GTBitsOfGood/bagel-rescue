import { LocationModel, Location, Address } from "../models/location";
import dbConnect from "../dbConnect";

export async function createLocation(newLocation: Location): Promise<Location> {
  await dbConnect();
  try {
    const location = new LocationModel(newLocation);
    await location.save();
    return location;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error creating location: ${err.message}`);
  }
}

export async function updateLocationName(
  id: string,
  newLocationName: string
): Promise<Location | null> {
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

export async function getAllLocations(): Promise<Location[] | null> {
  try {
    await dbConnect();
    const locations = await LocationModel.find();
    return locations;
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error getting all locations: ${err.message}`);
  }
}
