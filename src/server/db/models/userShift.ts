import mongoose, { Schema, Model, Document } from "mongoose";

interface UserShift extends Document {
  userId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  shiftDate: Date;
  shiftEndDate: Date;
  status: "Complete" | "Incomplete";
}

const UserShiftSchema: Schema<UserShift> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
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