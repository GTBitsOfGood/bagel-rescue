import mongoose, { Schema, Document, Model } from "mongoose";

export interface RecentShift {
  shiftName: string;
  shiftDate: Date;
}

export interface LeaderboardUser {
  firstName: string;
  lastName: string;
  bagelsDelivered?: number;
  totalDeliveries?: number;
}

export interface Analytics extends Document {
  totalBagelsDelivered: number;
  shiftsThisMonth: number;
  shiftsMonthlyAverage: number;
  recentShifts: RecentShift[];
  leaderboardUsersBagelsDelivered: LeaderboardUser[];
  leaderboardUsersTotalDeliveries: LeaderboardUser[];
}

const recentShiftSchema: Schema = new Schema({
  shiftName: { type: String, required: true },
  shiftDate: { type: Date, required: true },
});

const leaderboardUserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bagelsDelivered: { type: Number, required: true },
  totalDeliveries: { type: Number, required: true },
});

const analyticsSchema: Schema = new Schema({
  totalBagelsDelivered: {
    type: Number,
    default: 0,
  },
  shiftsThisMonth: {
    type: Number,
    default: 0,
  },
  shiftsMonthlyAverage: {
    type: Number,
    default: 0,
  },
  recentShifts: {
    type: [recentShiftSchema],
    default: [],
  },
  leaderboardUsersBagelsDelivered: {
    type: [leaderboardUserSchema],
    default: [],
  },
  leaderboardUsersTotalDeliveries: {
    type: [leaderboardUserSchema],
    default: [],
  },
});

const AnalyticsModel: Model<Analytics> =
  mongoose.models?.Analytics ||
  mongoose.model<Analytics>("Analytics", analyticsSchema);

const RecentShiftModel: Model<RecentShift> =
  mongoose.models?.RecentShift ||
  mongoose.model<RecentShift>("RecentShift", recentShiftSchema);

const LeaderboardUserModel: Model<LeaderboardUser> =
  mongoose.models?.LeaderboardUser ||
  mongoose.model<LeaderboardUser>("LeaderboardUser", leaderboardUserSchema);

export { AnalyticsModel, RecentShiftModel, LeaderboardUserModel };
