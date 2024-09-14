import mongoose, { Schema, Document, Model } from "mongoose";

const { ObjectId } = Schema.Types;

interface Shift extends Document {
    routeId: mongoose.Types.ObjectId;
    shiftDate: Date;
    capacity: number;
    currSignedUp: number;
}

const shiftSchema: Schema = new Schema({
    routeId: {
        type: ObjectId,
        ref: "Route"
    },
    shiftDate: {
        type: Date,
    },
    capacity: {
        type: Number,
        default: 0
    },
    currSignedUp: {
        type: Number,
        default: 0
    },
})

const ShiftModel: Model<Shift> = mongoose.models?.Shift || mongoose.model<Shift>("Shift", shiftSchema);

export { ShiftModel };
export type { Shift };
