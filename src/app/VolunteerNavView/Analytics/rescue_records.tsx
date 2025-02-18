import AnalyticsTable from "./analytics_table";
import AnalyticsBittenBagel from "../../../assets/analytics-bitten-bagel.svg";
import AnalyticsCar from "../../../assets/analytics-car.svg";
import Image from "next/image";

function RescueRecords() {
  const categories = ["Most Bagels Delivered in a Shift", "Longest Shift"];
  const units = ["Bagels", "Hours"];
  const svgs = [AnalyticsBittenBagel, AnalyticsCar];
  const offsets = ["4em", "6em"];
  const paddings = ["2.25em", "4em"];

  return (
    <div className="analytics-card rescue-records">
      <p className="analytics-card-title">Rescue Records</p>
      <div className="rescue-records-list">
        {categories.map((c, ind) => {
          return (
            <div className="rescue-records-section" key={c + "-rescue-record"}>
              <p className="rescue-record-title">{c}</p>
              <div
                className="rescue-record-stat-container"
                style={{ paddingBottom: paddings[ind] }}
              >
                <div className="rescue-record-image-container">
                  <Image
                    src={svgs[ind]}
                    alt="icon"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div
                  className="rescue-record-stat-box"
                  style={{ top: offsets[ind] }}
                >
                  <p className="rescue-record-stat">350</p>
                  <p>{units[ind]}</p>
                </div>
              </div>
              <AnalyticsTable
                headers={["Name", "Hours", "Date"]}
                data={[
                  ["Bob", "5", "10-29-2024"],
                  ["Bob", "5", "10-29-2024"],
                  ["Bob", "5", "10-29-2024"],
                ]}
                widths={[55, 25, 20]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RescueRecords;
