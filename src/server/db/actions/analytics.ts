"use server";

import dbConnect from "../dbConnect";
import { AnalyticsModel, Analytics } from "../models/analytics";

async function updateAnalytics(analytics: Analytics): Promise<Analytics> {
  try {
    await dbConnect();

    await AnalyticsModel.deleteMany({});

    return await analytics.save();
  } catch (error) {
    const err = error as Error;
    throw new Error(`Error has occurred when creating shift: ${err.message}`);
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
