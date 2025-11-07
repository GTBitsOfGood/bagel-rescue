import mongoose, { Schema, Model, Types } from "mongoose";

interface Confirmation extends Document{
  _id?: string;
  completed: boolean;
  bagelsPickedUp: number;
  bagelsDelivered: number;
  hours: number;
  minutes: number;
  comments: string;
  routeName: string;
  volunteerName: string;
  userId: Types.ObjectId;
  shiftDate: string;
  createdAt?: Date;
}

const ConfirmationSchema: Schema = new Schema(
  {
    completed: { type: Boolean, required: true },
    bagelsPickedUp: { type: Number, required: true, min: 0 },
    bagelsDelivered: { type: Number, required: true, min: 0 },
    minutes: { type: Number, required: true, min: 0 },
    comments: { type: String, default: "" },
    routeName: { type: String, required: true },
    volunteerName: { type: String, required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    shiftDate: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ConfirmationModel: Model<Confirmation> =
  mongoose.models?.ConfirmationForms ||
  mongoose.model<Confirmation>("ConfirmationForms", ConfirmationSchema);

export { ConfirmationModel };
export type { Confirmation };
