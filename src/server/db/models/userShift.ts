import mongoose, { Schema, Model, Document } from "mongoose";
const { ObjectId } = Schema.Types;


interface UserShift extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  recurrenceDates: string[];
  shiftDate: Date;
  shiftEndDate: Date;
  status: "Complete" | "Incomplete";
}

const UserShiftSchema: Schema<UserShift> = new Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    shiftId: {
      type: ObjectId,
      ref: "Shift",
      required: true,
    },
    routeId: {
      type: ObjectId,
      ref: "Route",
      required: true,
    },
    recurrenceDates: {
      type: [String],
      required: true,
    },
    shiftDate: {
      type: Date,
      required: true,
    },
    shiftEndDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Complete", "Incomplete"],
      default: "Incomplete",
    }
  }
);

const UserShiftModel: Model<UserShift> =
  mongoose.models?.UserShift ||
  mongoose.model<UserShift>("UserShift", UserShiftSchema);

export { UserShiftModel };
export type { UserShift };