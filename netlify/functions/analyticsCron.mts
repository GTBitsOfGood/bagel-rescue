import { updateAnalytics } from "../../src/server/db/actions/analytics";
import {
  getAllUserStats,
  getTotalBagelsDelivered,
} from "../../src/server/db/actions/User";
import {
  getShiftAnalytics,
  getRecentShifts,
} from "../../src/server/db/actions/shift";
import { getAllRoutes } from "../../src/server/db/actions/Route";
import {
  AnalyticsModel,
  LeaderboardUser,
} from "../../src/server/db/models/analytics";
import { IRoute } from "../../src/server/db/models/Route";

const handler = async () => {
  let retryCount = 0;
  let success = false;

  while (!success && retryCount < 1) {
    try {
      const totalBagelsDelivered = await getTotalBagelsDelivered();

      const shiftOverview = JSON.parse((await getShiftAnalytics()) || "");

      const recentShifts = JSON.parse((await getRecentShifts(5)) || "[]");
      const routes_data = JSON.parse((await getAllRoutes()) || "[]");
      const route_id_to_name_map = new Map<string, string>(
        routes_data.map((r: IRoute) => [r._id.toString(), r.routeName])
      );
      const formattedRecentShifts = recentShifts.map((s) => {
        return {
          shiftName: route_id_to_name_map.get(s.routeId) || "",
          shiftDate: s.date,
        };
      });

      const allUserStats = JSON.parse((await getAllUserStats()) || "[]");
      const bagelsDeliveredLeaderboardUsers = allUserStats
        .sort(
          (a: LeaderboardUser, b: LeaderboardUser) =>
            (b["bagelsDelivered"] as number) - (a["bagelsDelivered"] as number)
        )
        .slice(0, 3);
      const totalDeliveriesLeaderboardUsers = allUserStats
        .sort(
          (a: LeaderboardUser, b: LeaderboardUser) =>
            (b["totalDeliveries"] as number) - (a["totalDeliveries"] as number)
        )
        .slice(0, 3);

      await updateAnalytics(
        new AnalyticsModel({
          totalBagelsDelivered: totalBagelsDelivered,
          shiftsThisMonth: shiftOverview.thisMonth,
          shiftsMonthlyAverage: shiftOverview.monthlyAverage,
          recentShifts: formattedRecentShifts,
          leaderboardUsersBagelsDelivered: bagelsDeliveredLeaderboardUsers,
          leaderboardUsersTotalDeliveries: totalDeliveriesLeaderboardUsers,
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
