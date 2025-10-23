import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILocation {
  location: mongoose.Types.ObjectId;
  type: "dropoff" | "pickup";
}

export interface IRoute extends Document {
  _id: mongoose.Types.ObjectId;
  routeName: string;
  locationDescription: string;
  additionalInfo: string;
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
  additionalInfo: { type: String, default: "-" },
});

if (mongoose.models.Route) {
  delete mongoose.models.Route;
}

const RouteModel: Model<IRoute> = mongoose.models.Route || mongoose.model<IRoute>("Route", RouteSchema);

export default RouteModel;