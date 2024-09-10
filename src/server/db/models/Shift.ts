import mongoose from "mongoose";

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const shiftSchema = new Schema({
    id: {
        type: ObjectId,
        required: true
    },
    routeId: {
        type: ObjectId,
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

export default mongoose.models?.Shift || mongoose.model("Shift", shiftSchema);