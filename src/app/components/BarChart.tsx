import styles from "./BarChart.module.css";

interface Data {
    key: string;
    value: number;
}

interface BarChartProps {
    title: string;
    legend: string;
    units: string;
    monthlyData: Data[];
}

export const BarChart = ({
    title,
    legend,
    units,
    monthlyData,
}: BarChartProps) => {
    const totalVolunteerHours = monthlyData.reduce(
        (total, data) => total + data.value,
        0
    );
    const avgVolunteerHours = totalVolunteerHours / monthlyData.length;
    const maxVolunteerHours = Math.max(
        ...monthlyData.map((datum) => datum.value)
    );

    return (
        <div className={styles.chartCard}>
            <header className={styles.chartHeader}>
                <div className={styles.chartTitleGroup}>
                    <h3 className={styles.sectionTitle}>{title}</h3>
                </div>
            </header>

            <div className={styles.barChartContainer}>
                <div className={styles.yAxis}>
                    <div className={styles.yLabel}>{units}</div>
                    <div className={styles.yScale}>
                        <span className={styles.yTick}>
                            {Math.round(maxVolunteerHours)}
                        </span>
                        <span className={styles.yTick}>0</span>
                    </div>
                </div>

                <div className={styles.barChart}>
                    <div
                        className={styles.averageLine}
                        style={{
                            bottom: `${
                                (avgVolunteerHours / maxVolunteerHours) * 100
                            }%`,
                        }}
                    >
                        <span className={styles.yTickAverageLine}>
                            {Math.round(avgVolunteerHours)}
                        </span>
                    </div>

                    {monthlyData.map((data) => (
                        <div className={styles.barGroup} key={data.key}>
                            <div
                                className={styles.bar}
                                style={{
                                    height: `${Math.round(
                                        (data.value / maxVolunteerHours) * 160
                                    )}px`,
                                }}
                            />
                            <span className={styles.barLabel}>{data.key}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendDot} />
                    {legend}
                </div>
                <div className={styles.legendItem}>
                    <span
                        className={`${styles.legendDot} ${styles.legendDashed}`}
                    />
                    Average {units} {"("}
                    {Math.round(avgVolunteerHours)}
                    {")"}
                </div>
            </div>
        </div>
    );
};
