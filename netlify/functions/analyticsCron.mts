import { updateAnalytics } from "../../src/server/db/actions/analytics";
import { getTotalBagelsDelivered } from "../../src/server/db/actions/User";
import { getShift, getShiftAnalytics } from "../../src/server/db/actions/shift";
import AnalyticsModel from "../../src/server/db/models/analytics";

const handler = async () => {
  let retryCount = 0;
  let success = false;

  while (!success && retryCount < 3) {
    try {
      const totalBagelsDelivered = await getTotalBagelsDelivered();
      const shiftOverview = JSON.parse((await getShiftAnalytics()) || "");
      await updateAnalytics(
        new AnalyticsModel({
          totalBagelsDelivered: totalBagelsDelivered,
          shiftsThisMonth: shiftOverview.thisMonth,
          shiftMonthlyAverage: shiftOverview.monthlyAverage,
        })
      );
      success = true;
      console.log("Analytics updated successfully");
      return { statusCode: 200 };
    } catch (err) {
      console.log(err);
      retryCount++;
    }
  }

  return { statusCode: 500 };
};

export { handler };

export const config = {
  schedule: "@daily",
};
