import mongoose, { Schema, Document, Model } from "mongoose";
import { RRule } from "rrule";

const { ObjectId } = Schema.Types;

interface Recurrence {
  date: Date;
  currSignedUp: number;
}

interface Shift extends Document {
  routeId: mongoose.Types.ObjectId;
  shiftDate: Date;
  shiftEndDate: Date;
  currSignedUp: number;
  recurrenceRule: string;
  recurrences: Recurrence[];
  timeSpecific: boolean;
  additionalInfo: string;
}

const recurrenceSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  currSignedUp: {
    type: Number,
    default: 0,
  },
});

const shiftSchema: Schema = new Schema({
  routeId: {
    type: ObjectId,
    ref: "Route",
  },
  shiftDate: {
    type: Date,
  },
  shiftEndDate: {
    type: Date,
  },
  currSignedUp: {
    type: Number,
    default: 0,
  },
  recurrenceRule: {
    type: String,
    default: "",
    validate: {
      validator: function (str: string) {
        try {
          RRule.fromString(str);
          return true;
        } catch (e) {
          return false;
        }
      },
    },
  },
  recurrences: {
    type: [recurrenceSchema],
    default: [],
  },
  timeSpecific: {
    type: Boolean,
    default: false,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
});

// Force mongoose to rebuild the model if it already exists
if (mongoose.models.Shift) {
  delete mongoose.models.Shift;
}
if (mongoose.models.Recurrence) {
  delete mongoose.models.Recurrence;
}

const ShiftModel: Model<Shift> = mongoose.model<Shift>("Shift", shiftSchema);
const RecurrenceModel: Model<Recurrence> = mongoose.model<Recurrence>(
  "Recurrence",
  recurrenceSchema
);

export { ShiftModel, RecurrenceModel };
export type { Shift, Recurrence };

// const ShiftModel: Model<Shift> =
//   mongoose.models?.Shift || mongoose.model<Shift>("Shift", shiftSchema);
// const RecurrenceModel: Model<Recurrence> =
//   mongoose.models?.Recurrence ||
//   mongoose.model<Recurrence>("Recurrence", recurrenceSchema);

// export { ShiftModel, RecurrenceModel };
// export type { Shift, Recurrence };
