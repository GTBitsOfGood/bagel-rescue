import AnalyticsBagel from "../../assets/analytics_bagel.svg";
import Image from "next/image";

function Overview() {
  const categories = ["Bagels", "Shifts", "Hours"];

  return (
    <div className="analytics-card overview">
      <p className="analytics-card-title">Overview</p>
      <div className="overview-stats">
        <div className="analytics-bagel-container">
          <Image
            src={AnalyticsBagel}
            alt="icon"
            layout="fill"
            objectFit="contain"
          />
          <div className="bagels-rescued-label">
            <p className="bagels-rescued-label-text">Bagels Rescued</p>
          </div>
          <div className="bagels-rescued-stat">
            <p className="bagels-rescued-number">3500</p>
            <p className="bagels-rescued-unit">Bagels</p>
          </div>
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
    </div>
  );
}

export default Overview;
