import mongoose, { Schema, Model } from "mongoose";

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
