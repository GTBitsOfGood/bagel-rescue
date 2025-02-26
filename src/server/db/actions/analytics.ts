"use server";

import dbConnect from "../dbConnect";
import { AnalyticsModel, Analytics } from "../models/analytics";
import User from "../models/User";

async function updateAnalytics(): Promise<Analytics> {
  try {
    await dbConnect();

    const [result] = await User.aggregate([
      {
        $group: {
          _id: null,
          totalMonthlyShifts: { $sum: "$monthlyShiftAmount" },
          totalMonthlyHours: { $sum: "$monthlyHoursVolunteered" },
          totalYearlyShifts: { $sum: "$yearlyShiftAmount" },
          totalYearlyHours: { $sum: "$yearlyHoursVolunteered" },
        },
      },
    ]);

    let analytics = await AnalyticsModel.findOne({});
    if (!analytics) {
      analytics = new AnalyticsModel();
    }

    if (result) {
      analytics.shiftsThisMonth = result.totalMonthlyShifts || 0;
      analytics.hoursThisMonth = result.totalMonthlyHours || 0;
      analytics.shiftsThisYear = result.totalYearlyShifts || 0;
      analytics.hoursThisYear = result.totalYearlyHours || 0;
    } else {
      analytics.shiftsThisMonth = 0;
      analytics.hoursThisMonth = 0;
      analytics.shiftsThisYear = 0;
      analytics.hoursThisYear = 0;
    }
    
    return await analytics.save();
  } catch (error: any) {
    throw new Error(`Error when updating analytics: ${error.message}`);
  }
}

async function getAnalytics(): Promise<string | null> {
  try {
    await dbConnect();

    return JSON.stringify(await AnalyticsModel.findOne());
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating shift: ${err.message}`);
  }
}

export { updateAnalytics, getAnalytics };
