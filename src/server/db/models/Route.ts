import mongoose, { Schema, Document } from "mongoose";
import { ObjectId } from "mongoose";

export interface ILocation {
  location: mongoose.Types.ObjectId;
  type: "dropoff" | "pickup";
}

export interface IRoute extends Document {
  routeName: string;
  locationDescription: string;
  locations: ILocation[];
}

const RouteSchema: Schema = new Schema({
  routeName: { type: String, required: true },
  locationDescription: { type: String, default: "" },
  locations: {
    type: [
      {
        location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
        type: { type: String, enum: ["dropoff", "pickup"], required: true },
      },
    ],
    default: [],
  },
});

export default mongoose.models?.Route ||
  mongoose.model<IRoute>("Route", RouteSchema);