import mongoose, { Schema, Document, Model } from "mongoose";

// interface Shift {
//   shiftName: string;
//   date: Date;
//   numBagels?: number;
//   numHours?: number;
// }

export interface Analytics extends Document {
  totalBagelsDelivered: number;
  shiftsThisMonth: number;
  shiftMonthlyAverage: number;
  // shiftsWithMostBagels: Shift[];
  // longestShifts: Shift[];
}

const analyticsSchema: Schema = new Schema({
  totalBagelsDelivered: {
    type: Number,
    required: true,
  },
  shiftsThisMonth: {
    type: Number,
    required: true,
  },
  shiftMonthlyAverage: {
    type: Number,
    required: true,
  },
});

const AnalyticsModel: Model<Analytics> =
  mongoose.models?.Analytics ||
  mongoose.model<Analytics>("Analytics", analyticsSchema);

export default AnalyticsModel;
