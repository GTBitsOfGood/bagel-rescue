import { getAllUserStats } from "@/server/db/actions/User";
import { useEffect, useState } from "react";
import "./stylesheet.css";

function Leaderboard() {
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

  function LeaderboardTable() {
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

  return (
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
      {LeaderboardTable()}
    </div>
  );
}

export default Leaderboard;
