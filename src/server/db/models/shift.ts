import mongoose, { Schema, Document, Model } from "mongoose";
import { RRule } from "rrule";

const { ObjectId } = Schema.Types;

interface Recurrence {
  date: Date;
  capacity: number;
  currSignedUp: number;
}

interface Shift extends Document {
  _id: mongoose.Types.ObjectId;
  routeId: mongoose.Types.ObjectId;
  shiftStartTime: Date;
  shiftEndTime: Date;
  shiftStartDate: Date;
  shiftEndDate: Date;
  additionalInfo: string;
  recurrenceDates: string[];
  timeSpecific: boolean;
  confirmationForm: { [date: string]: mongoose.Types.ObjectId };
  canceledShifts: Date[];
  comments: { [date: string]: string };
  creationDate: Date;

  // Old Schema
  // routeId: mongoose.Types.ObjectId;
  shiftDate: Date;
  // shiftEndDate: Date;
  capacity: number;
  currSignedUp: number;
  recurrenceRule: string;
  recurrences: Recurrence[];
}

const recurrenceSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  capacity: {
    type: Number,
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
  shiftStartTime: {
    type: Date,
  },
  shiftEndTime: {
    type: Date,
  },
  shiftStartDate: {
    type: Date,
  },
  shiftEndDate: {
    type: Date,
  },
  additionalInfo: {
    type: String,
  },
  recurrenceDates: {
    type: [String],
    default: [],
  },
  timeSpecific: {
    type: Boolean,
  },
  confirmationForm: {
    type: Map,
    of: ObjectId
  },
  canceledShifts: {
    type: [Date],
  },
  comments: {
    type: Map,
    of: String
  },
  creationDate: {
    type: Date,
  },

  // Old Schema
  // routeId: {
  //   type: ObjectId,
  //   ref: "Route",
  // },
  shiftDate: {
    type: Date,
  },
  // shiftEndDate: {
  //   type: Date,
  // },
  capacity: {
    type: Number,
    required: true,
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
