"use client";

import { useEffect, useState } from "react";
import "./stylesheet.css";
import { getAllUserStats, UserStats } from "@/server/db/actions/User";

function Analytics() {
  const leaderboardFields = ["Bagels Delivered", "Total Deliveries"];
  const fieldDisplayNametoQueryNameMapping = new Map([
    ["Bagels Delivered", "bagelsDelivered"],
    ["Total Deliveries", "totalDeliveries"],
  ]);
  const [currLeaderboardField, setCurrLeaderboardField] =
    useState<string>("Bagels Delivered");
  const [allUserStats, setAllUserStats] = useState<LeaderboardStats[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardStats[]>(
    []
  );

  type LeaderboardStats = {
    firstName: string;
    lastName: string;
    bagelsDelivered: number;
    totalDeliveries: number;
  };

  useEffect(() => {
    const fetchAllUserStats = async () => {
      const response = await getAllUserStats();
      const data: LeaderboardStats[] = JSON.parse(response || "[]");
      setAllUserStats(data || []);
      updateLeaderboard(currLeaderboardField);
    };
    fetchAllUserStats();
  }, []);

  useEffect(() => {
    updateLeaderboard(
      fieldDisplayNametoQueryNameMapping.get(currLeaderboardField) || ""
    );
  }, [allUserStats, currLeaderboardField]);

  function updateLeaderboard(field: string) {
    if (field == "") {
      return;
    }
    const leaderboard = allUserStats
      .sort(
        (a: LeaderboardStats, b: LeaderboardStats) =>
          (b[field as keyof LeaderboardStats] as number) -
          (a[field as keyof LeaderboardStats] as number)
      )
      .slice(0, 3);
    setLeaderboardUsers(leaderboard);
  }

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
          <div className="category-overview" key={c + "-category"}>
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
            <div className="rescue-records-section" key={c + "-rescue-record"}>
              <p className="rescue-record-title">{c}</p>
              <div className="rescue-record-stat-box">
                <p className="rescue-record-stat">350</p>
                <p>{units[ind]}</p>
              </div>
              {AnalyticsTable()}
            </div>
          );
        })}
      </div>
    );
  }

  function RecentShifts() {
    return <div>{AnalyticsTable()}</div>;
  }

  function Leaderboard() {
    return (
      <div>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>{currLeaderboardField}</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardUsers.map((u, ind) => {
              return (
                <tr key={u.firstName + u.lastName}>
                  <td>
                    <div className="leaderboard-entry-name">
                      <p className="bold">{ind + 1}</p>
                      <p>{u.firstName + " " + u.lastName}</p>
                    </div>
                  </td>
                  <td>
                    {
                      u[
                        fieldDisplayNametoQueryNameMapping.get(
                          currLeaderboardField
                        ) as keyof LeaderboardStats
                      ]
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function AnalyticsTable() {
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
              <select
                className="leaderboard-stat"
                id="leaderboard-stat"
                onChange={(e) => {
                  setCurrLeaderboardField(e.target.value);
                  updateLeaderboard(
                    fieldDisplayNametoQueryNameMapping.get(e.target.value) || ""
                  );
                }}
              >
                {leaderboardFields.map((s) => (
                  <option value={s} key={s}>
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
