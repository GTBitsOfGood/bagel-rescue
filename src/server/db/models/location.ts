import mongoose, { Schema, Model } from "mongoose";

interface Address {
  street: string;
  city: string;
  zipCode: number;
  state: string;
}

interface Location {
  _id?: string;
  locationName: string;
  notes: string;
  contact: string;
  address: Address;
  type: "Pick-Up" | "Drop-Off";
  area: string;
  bags: number | "All Bags";
}

const AddressSchema: Schema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: Number, required: true },
  state: { type: String, required: true },
});

const LocationSchema: Schema = new Schema({
  locationName: { type: String, required: true },
  notes: { type: String, default: "" },
  contact: { type: String, default: "" },
  address: { type: AddressSchema, required: true },
  type: { type: String, enum: ["Pick-Up", "Drop-Off"], required: true },
  area: { type: String, default: "", required: true },
  bags: { type: Number, default: 0 },
});

const LocationModel: Model<Location> =
  mongoose.models?.Location ||
  mongoose.model<Location>("Location", LocationSchema);

export { LocationModel };
export type { Location, Address };
