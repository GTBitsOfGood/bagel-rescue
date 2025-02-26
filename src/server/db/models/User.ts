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
  totalDeliveries?: number;
  phoneNumber?: string;
  acceptableLocations?: string;
  lifetimeHoursVolunteered?: number;
  monthlyHoursVolunteered?: number;
  yearlyHoursVolunteered?: number;
  monthlyShiftAmount?: number;
  yearlyShiftAmount?: number;
  lastMonthlyReset?: Date;
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
  lifetimeHoursVolunteered: {
    type: Number,
    default: 0,
  },
  monthlyHoursVolunteered: {
    type: Number,
    default: 0,
  },
  yearlyHoursVolunteered: {
    type: Number,
    default: 0,
  },
  monthlyShiftAmount: {
    type: Number,
    default: 0,
  },
  yearlyShiftAmount: {
    type: Number,
    default: 0,
  },
  lastMonthlyReset: {
    type: Date,
    default: new Date(),
  },
});

userSchema.methods.populateDeliveries = function () {
  this.totalDeliveries = (this.totalDeliveries || 0) + 1;
  return this.save();
};

userSchema.methods.populateHours = function (hours: number) {
  this.lifetimeHoursVolunteered = (this.lifetimeHoursVolunteered || 0) + hours;
  return this.save();
};

userSchema.methods.checkAndResetStats = function () {
  const now = new Date();
  if (!this.lastMonthlyReset) {
    this.lastMonthlyReset = now;
  }

  const lastReset = new Date(this.lastMonthlyReset);
  const sameYear = lastReset.getFullYear() === now.getFullYear();
  const sameMonth = lastReset.getMonth() === now.getMonth();

  if (!sameYear) {
    this.yearlyHoursVolunteered = 0;
    this.yearlyShiftAmount = 0;
  }

  if (!sameYear || !sameMonth) {
    this.monthlyHoursVolunteered = 0;
    this.monthlyShiftAmount = 0;
    this.lastMonthlyReset = now;
  }
};

userSchema.methods.populateMonthlyHours = function (hours: number) {
  this.checkAndResetStats();
  this.monthlyHoursVolunteered = (this.monthlyHoursVolunteered || 0) + hours;
  return this.save();
};

userSchema.methods.populateYearlyHours = function (hours: number) {
  this.checkAndResetStats();
  this.yearlyHoursVolunteered = (this.yearlyHoursVolunteered || 0) + hours;
  return this.save();
};

userSchema.methods.populateMonthlyShifts = function () {
  this.checkAndResetStats();
  this.monthlyShiftAmount = (this.monthlyShiftAmount || 0) + 1;
  return this.save();
};

userSchema.methods.populateYearlyShifts = function () {
  this.checkAndResetStats();
  this.yearlyShiftAmount = (this.yearlyShiftAmount || 0) + 1;
  return this.save();
};

export default mongoose.models?.User || mongoose.model("User", userSchema);
