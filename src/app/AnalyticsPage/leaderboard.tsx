import { useState } from "react";
import "./stylesheet.css";
import { LeaderboardUser } from "@/server/db/models/analytics";

type LeaderboardProps = {
  bagelsDeliveredUsers: LeaderboardUser[];
  totalDeliveriesUsers: LeaderboardUser[];
};

function Leaderboard({
  bagelsDeliveredUsers,
  totalDeliveriesUsers,
}: LeaderboardProps) {
  const leaderboardFields = ["Bagels Delivered", "Total Deliveries"];
  const displayNametoFieldNameMapping = new Map([
    ["Bagels Delivered", "bagelsDelivered"],
    ["Total Deliveries", "totalDeliveries"],
  ]);
  const [currLeaderboardField, setCurrLeaderboardField] =
    useState<string>("Bagels Delivered");
  const fieldNametoLeaderboardList = new Map<string, LeaderboardUser[]>([
    ["Bagels Delivered", bagelsDeliveredUsers],
    ["Total Deliveries", totalDeliveriesUsers],
  ]);

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
            {fieldNametoLeaderboardList
              .get(currLeaderboardField)!
              .map((u, ind) => {
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
                          displayNametoFieldNameMapping.get(
                            currLeaderboardField
                          ) as keyof LeaderboardUser
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
