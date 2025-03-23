import mongoose, { Schema, Model, Document } from "mongoose";

/**
 * UserShift interface extends Mongoose's Document interface
 * to ensure typed access to document fields.
 */
interface UserShift extends Document {
  userId: mongoose.Types.ObjectId;
  shiftId: mongoose.Types.ObjectId;

  /**
   * Optional fields to store additional signup details.
   */
  signupDate?: Date;
  status?: "active" | "cancelled";
}

/**
 * Defines the UserShift schema for tracking the relationship
 * between a User and a Shift.
 */
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
    signupDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
  },
  {
    // Automatically creates createdAt and updatedAt fields
    timestamps: true,
  }
);

/**
 * Reuse the existing model if available (helps with hot-reload in development),
 * otherwise create a new model named 'UserShift'.
 */
const UserShiftModel: Model<UserShift> =
  mongoose.models?.UserShift ||
  mongoose.model<UserShift>("UserShift", UserShiftSchema);

export { UserShiftModel };
export type { UserShift };
