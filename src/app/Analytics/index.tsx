import "./stylesheet.css";

function Analytics() {
  const leaderboardStats = ["Bagels Delivered", "Other"];

  function Overview() {
    const categories = ["Bagels", "Shifts", "Hours"];
    return (
      <div className="overview-stats">
        <p className="bagels-rescued-label">Bagels Rescued</p>
        <div className="bagels-rescued-stat">
          <p className="bagels-rescued-number">3500</p>
          <p className="bagels-rescued-unit">Bagels</p>
        </div>
        {categories.map((c) => (
          <div className="category-overview" key={c}>
            <p className="category-overview-title">{c}</p>
            <div className="category-overview-row">
              <div className="category-overview-card">
                <p className="category-overview-label">This Month</p>
                <p className="category-overview-statistic">5</p>
              </div>
              <div className="category-overview-card">
                <p className="category-overview-label">Monthly Average</p>
                <p className="category-overview-statistic">5</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function RescueRecords() {
    const categories = ["Most Bagels Delivered in a Shift", "Longest Shift"];
    const units = ["Bagels", "Hours"];
    return (
      <div className="rescue-records-list">
        {categories.map((c, ind) => {
          return (
            <div className="rescue-records-section" key={c}>
              <p className="rescue-record-title">{c}</p>
              <div className="rescue-record-stat-box">
                <p className="rescue-record-stat">350</p>
                <p>{units[ind]}</p>
              </div>
              {CompactTable()}
            </div>
          );
        })}
      </div>
    );
  }

  function RecentShifts() {
    return <div>{CompactTable()}</div>;
  }

  function Leaderboard() {
    return (
      <div>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Bagels Delivered</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Apples</td>
              <td>$1.50</td>
            </tr>
            <tr>
              <td>Bananas</td>
              <td>$0.75</td>
            </tr>
            <tr>
              <td>Cherries</td>
              <td>$3.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  function CompactTable() {
    return (
      <table className="compact-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Apples</td>
            <td>$1.50</td>
            <td>50</td>
          </tr>
          <tr>
            <td>Bananas</td>
            <td>$0.75</td>
            <td>100</td>
          </tr>
          <tr>
            <td>Cherries</td>
            <td>$3.00</td>
            <td>25</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div className="container">
      <p className="header-text">Analytics</p>
      <hr className="separator" />
      <div className="analytics-container">
        <div className="analytics-subcontainer">
          <div className="analytics-card overview">
            <p className="analytics-card-title">Overview</p>
            {Overview()}
          </div>
          <div className="analytics-card rescue-records">
            <p className="analytics-card-title">Rescue Records</p>
            {RescueRecords()}
          </div>
        </div>
        <div className="analytics-subcontainer">
          <div className="analytics-card recent-shifts">
            <p className="analytics-card-title">Recent Shifts</p>
            {RecentShifts()}
          </div>
          <div className="analytics-card leaderboard">
            <div className="leaderboard-header">
              <p className="analytics-card-title">Leaderboard</p>
              <select className="leaderboard-stat" id="leaderboard-stat">
                {leaderboardStats.map((s) => (
                  <option value="s" key="s">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {Leaderboard()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
