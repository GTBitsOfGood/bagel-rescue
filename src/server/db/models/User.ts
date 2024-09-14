import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const { Schema } = mongoose;

export interface IUser {
  _id?: ObjectId;
  username: string;
  isAdmin?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  bagelsDelivered?: number;
  totalDeliveries?: number;
  phoneNumber?: string;
  acceptableLocations?: string;
}

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format",
    ],
  },
  bagelsDelivered: {
    type: Number,
    default: 0,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  acceptableLocations: {
    type: String,
    default: "",
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
