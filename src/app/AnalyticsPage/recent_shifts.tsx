import { useEffect, useState } from "react";
import AnalyticsTable from "./analytics_table";
import { getAllShifts } from "@/server/db/actions/shift";
import { Shift } from "@/server/db/models/shift";
import { getAllRoutes } from "@/server/db/actions/Route";
import { IRoute } from "@/server/db/models/Route";

function RecentShifts() {
  type RecentShift = {
    routeId: string;
    date: Date;
  };

  const [recentShifts, setRecentShifts] = useState<RecentShift[]>([]);
  const [routeIdToNameMap, setRouteIdToNameMap] = useState(
    new Map<string, string>()
  );

  useEffect(() => {
    const fetchRouteMap = async () => {
      const routes_response = await getAllRoutes();
      const routes_data = JSON.parse(routes_response || "[]");
      const routes_map = new Map<string, string>(
        routes_data.map((r: IRoute) => [r._id.toString(), r.routeName])
      );
      setRouteIdToNameMap(routes_map);
    };

    const fetchRecentShifts = async () => {
      const response = await getAllShifts();
      const data = JSON.parse(response || "[]");
      const shifts = data
        .flatMap((s: Shift) =>
          s.recurrences.map((r) => ({
            routeId: s.routeId.toString(),
            date: new Date(r.date),
          }))
        )
        .sort(
          (a: RecentShift, b: RecentShift) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      setRecentShifts(shifts || []);
    };

    fetchRouteMap();
    fetchRecentShifts();
  }, []);

  function getTableData() {
    return recentShifts
      .slice(0, 5)
      .map((s) => [
        routeIdToNameMap.get(s.routeId) || "",
        "5",
        new Intl.DateTimeFormat("en-US").format(s.date),
      ]);
  }

  return (
    <div className="analytics-card recent-shifts">
      <p className="analytics-card-title">Recent Shifts</p>
      <AnalyticsTable
        headers={["Name", "Bagels", "Date"]}
        data={getTableData()}
        widths={[55, 25, 20]}
      />
    </div>
  );
}

export default RecentShifts;
