import AnalyticsTable from "./analytics_table";

function RecentShifts() {
  return (
    <div className="analytics-card recent-shifts">
      <p className="analytics-card-title">Recent Shifts</p>
      <AnalyticsTable />
    </div>
  );
}

export default RecentShifts;
