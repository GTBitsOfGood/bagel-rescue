import {
  getAllUserStats,
  getTotalBagelsDelivered,
} from "../../src/server/db/actions/User";
import {
  getShiftAnalytics,
  getRecentShifts,
} from "../../src/server/db/actions/shift";
import { getAllRoutes } from "../../src/server/db/actions/Route";

type AggregatedData = {
  totalBagelsDelivered: number | null;
  shiftsThisMonth: any;
  shiftsMonthlyAverage: any;
  recentShifts: any;
  aggregatedBagelsDelivered: number;
  aggregatedTotalDeliveries: number;
};

const aggregateHandler = async () => {
  let retryCount = 0;
  let success = false;

  let aggregatedData: AggregatedData | null = null; // Store aggregated data for display

  while (!success && retryCount < 1) {
    try {
      const totalBagelsDelivered = await getTotalBagelsDelivered();

      const shiftOverview = JSON.parse((await getShiftAnalytics()) || "");
      const recentShifts = JSON.parse((await getRecentShifts(5)) || "[]");

      const routes_data = JSON.parse((await getAllRoutes()) || "[]");
      const route_id_to_name_map = new Map(
        routes_data.map((r) => [r._id.toString(), r.routeName])
      );
      const formattedRecentShifts = recentShifts.map((s) => {
        return {
          shiftName: route_id_to_name_map.get(s.routeId) || "",
          shiftDate: s.date,
        };
      });

      const allUserStats = JSON.parse((await getAllUserStats()) || "[]");

      const aggregatedStats = allUserStats.reduce(
        (totals, user) => {
          return {
            totalBagelsDelivered:
              totals.totalBagelsDelivered + (user.bagelsDelivered || 0),
            totalDeliveries:
              totals.totalDeliveries + (user.totalDeliveries || 0),
          };
        },
        {
          totalBagelsDelivered: 0,
          totalDeliveries: 0,
        }
      );

      aggregatedData = {
        totalBagelsDelivered,
        shiftsThisMonth: shiftOverview.thisMonth,
        shiftsMonthlyAverage: shiftOverview.monthlyAverage,
        recentShifts: formattedRecentShifts,
        aggregatedBagelsDelivered: aggregatedStats.totalBagelsDelivered,
        aggregatedTotalDeliveries: aggregatedStats.totalDeliveries,
      };

      success = true;
      console.log(
        "Aggregated analytics calculated successfully",
        aggregatedData
      );
      return {
        statusCode: 200,
        message: "Aggregation successful.",
        data: aggregatedData,
      };
    } catch (err) {
      console.error(err);
      retryCount++;
    }
  }

  return {
    statusCode: 500,
    message: "Aggregation failed.",
    data: aggregatedData,
  };
};

export const handler = async (event, context) => {
  try {
    const result = await aggregateHandler();
    return {
      statusCode: result.statusCode,
      body: JSON.stringify({
        message: result.message,
        data: result.data,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error during aggregation",
        error: error.message,
      }),
    };
  }
};

export { aggregateHandler };

export const config = {
  schedule: "@daily",
};
