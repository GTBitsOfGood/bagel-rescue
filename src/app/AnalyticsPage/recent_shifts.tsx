import { RecentShift } from "@/server/db/models/analytics";
import AnalyticsTable from "./analytics_table";

type RecentShiftsProps = {
  recentShifts: RecentShift[];
};

function RecentShifts({ recentShifts }: RecentShiftsProps) {
  function getTableData() {
    return recentShifts.map((s) => [
      s.shiftName,
      "5",
      new Intl.DateTimeFormat("en-US").format(new Date(s.shiftDate)),
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
