import mongoose from "mongoose";
import { ObjectId } from "mongoose";

const { Schema } = mongoose;

interface shiftCompleted {
  shiftId: string;
  timeTakenToComplete: number;
}


export interface IUser {
  _id?: ObjectId;
  username: string;
  isAdmin?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  bagelsDelivered?: number;
  bagelsPickedUp?: number;
  shiftsCompleted?: shiftCompleted[];
  totalDeliveries?: number;
  phoneNumber?: string;
  acceptableLocations?: string;
}

const shiftCompletedSchema = new Schema({
  shiftId: {
    type: Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },
  timeTakenToComplete: {
    type: Number,
    required: true,
  },
});

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
  bagelsPickedUp: {
    type: Number,
    default: 0,
  },
  shiftsCompleted: {
    type: [shiftCompletedSchema],
    default: [],
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

export default mongoose.models?.User || mongoose.model("User", userSchema);
