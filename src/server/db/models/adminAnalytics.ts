import mongoose, { Schema, Document, Model } from "mongoose";
import {IUser} from "./User";
import User from "./User";

interface RecentShift {
    routeName: string; 
    shiftDate: Date;
    status: string;
    duration: number;
}

export interface IAdminAnalytics extends Document {
    shiftsThisMonth: number;
    monthlyShiftAverage: number;
    shiftsThisYear: number;
    yearlyShiftsAverage: number;
    totalShiftDurationThisMonth: number;
    totalShiftDurationThisYear: number;
    averageShiftDurationThisMonth: number;
    averageShiftDurationThisYear: number;
    recentShifts: RecentShift[]; 
    totalVolunteers: number;
    activeVolunteers: number;
    numberOfNewVolunteers: number;
    newVolunteers: IUser[]; 
    volunteersWithMultipleShifts: IUser[];
    lastUpdatedAt: Date; 
}

const recentShiftSchema: Schema = new Schema({
    routeName: {
        type: String,
        required: true,
    },
    shiftDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["complete", "incomplete", "late", "sub request"],
    },
    duration: {
        type: Number,
        required: true,
    },
});


const adminAnalyticsSchema: Schema = new Schema({
    "shiftsThisMonth": {
        type: Number,
        default: 0,
    },
    "monthlyShiftAverage": {
        type: Number,
        default: 0,
    },
    "shiftsThisYear": {
        type: Number,
        default: 0,
    },
    "yearlyShiftsAverage": {
        type: Number,
        default: 0,
    },
    "totalShiftDurationThisMonth": {
        type: Number,
        default: 0,
    },
    "totalShiftDurationThisYear": {
        type: Number,
        default: 0,
    },
    "averageShiftDurationThisMonth": {
        type: Number,
        default: 0,
    },
    "averageShiftDurationThisYear": {
        type: Number,
        default: 0,
    },
    "recentShifts": {
        type: [recentShiftSchema],
        default: [],
    },
    "totalVolunteers": {
        type: Number,
        default: 0,
    },
    "activeVolunteers": {
        type: Number,
        default: 0,
    },
    "numberOfNewVolunteers": {
        type: Number,
        default: 0,
    },
    "newVolunteers": {
        type: [User.schema],
        default: [],
    },
    "volunteersWithMultipleShifts": {
        type: [User.schema],
        default: [], 
    },
    "lastUpdatedAt": {
        type: Date,
        default: Date.now,
    },
});


export default mongoose.models?.adminAnalytics || mongoose.model<IAdminAnalytics>("adminAnalytics", adminAnalyticsSchema);