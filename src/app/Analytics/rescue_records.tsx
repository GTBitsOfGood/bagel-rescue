import AnalyticsTable from "./analytics_table";

function RescueRecords() {
  const categories = ["Most Bagels Delivered in a Shift", "Longest Shift"];
  const units = ["Bagels", "Hours"];

  return (
    <div className="analytics-card rescue-records">
      <p className="analytics-card-title">Rescue Records</p>
      <div className="rescue-records-list">
        {categories.map((c, ind) => {
          return (
            <div className="rescue-records-section" key={c + "-rescue-record"}>
              <p className="rescue-record-title">{c}</p>
              <div className="rescue-record-stat-box">
                <p className="rescue-record-stat">350</p>
                <p>{units[ind]}</p>
              </div>
              <AnalyticsTable />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RescueRecords;
