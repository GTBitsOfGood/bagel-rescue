import { useMemo } from "react";
import styles from "./LineChart.module.css";
import { average } from "firebase/firestore";

interface Data {
    key: string;
    value: number;
}

interface LineChartProps {
    title: string;
    legend: string;
    units: string;
    monthlyData: Data[];
}

export const LineChart = ({
    title,
    legend,
    units,
    monthlyData,
}: LineChartProps) => {
    const maxMonthly = Math.max(...monthlyData.map((datum) => datum.value), 1);

    const chartLinePoints = useMemo(() => {
        if (monthlyData.length === 0) {
            return "";
        }

        return monthlyData
            .map((datum, index) => {
                const x =
                    monthlyData.length === 1
                        ? 50
                        : 220 / (2 * monthlyData.length) -
                          60 +
                          (220 / monthlyData.length) * index;
                const y = 100 - (datum.value / maxMonthly) * 87;

                return `${x},${y}`;
            })
            .join(" ");
    }, [maxMonthly, monthlyData]);

    const averageShifts = Math.round(
        monthlyData.reduce((total, datum) => total + datum.value, 0) /
            monthlyData.length
    );

    const avgOffset =
        maxMonthly > 0 && Number.isFinite(averageShifts)
            ? (averageShifts / maxMonthly - 0.5) * 140
            : 0;

    console.log(averageShifts, maxMonthly);

    const averageLineY = Math.round(100 - (averageShifts / maxMonthly) * 87);

    return (
        <div className={styles.chartCard}>
            <header className={styles.chartHeader}>
                <h3 className={styles.sectionTitle}>{title}</h3>
            </header>

            <div className={styles.chartContent}>
                <div className={styles.yAxis}>
                    <div className={styles.yLabel}>{units}</div>
                    <div className={styles.yScale}>
                        <span className={styles.yTick}>{maxMonthly}</span>
                        <span
                            className={styles.yTick}
                            style={{
                                position: "relative",
                                top: `${-Math.round(avgOffset)}px`,
                            }}
                        >
                            {averageShifts}
                        </span>
                        <span className={styles.yTick}>0</span>
                    </div>
                </div>

                <div className={styles.chartMain}>
                    <div className={styles.lineChart}>
                        <svg
                            className={styles.lineChartSvg}
                            viewBox="0 0 100 100"
                        >
                            {/* Grid lines */}
                            <g className={styles.gridLines}>
                                <line
                                    x1="-60"
                                    y1={averageLineY}
                                    x2="160"
                                    y2={averageLineY}
                                />
                            </g>

                            {/* Main line path */}
                            <polyline
                                className={styles.lineChartPath}
                                points={chartLinePoints}
                                fill="none"
                            />

                            {/* Data points */}
                            {monthlyData.map((datum, index) => {
                                const x =
                                    monthlyData.length === 1
                                        ? 50
                                        : 220 / (2 * monthlyData.length) -
                                          60 +
                                          (220 / monthlyData.length) * index;
                                const y = 100 - (datum.value / maxMonthly) * 87;

                                return (
                                    <g key={`${datum.key}-point`}>
                                        {/* Hover area */}
                                        <circle
                                            className={
                                                styles.lineChartHoverArea
                                            }
                                            cx={x}
                                            cy={y}
                                            r={3}
                                        />
                                        {/* Visible dot */}
                                        <circle
                                            className={styles.lineChartDot}
                                            cx={x}
                                            cy={y}
                                            r={3}
                                        />
                                        {/* Tooltip */}
                                        <text
                                            className={styles.lineChartTooltip}
                                            x={x}
                                            y={y - 6}
                                            textAnchor="middle"
                                        >
                                            {datum.value}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* X-axis labels at the bottom */}
                    <div className={styles.lineChartLabels}>
                        {monthlyData.map((datum) => (
                            <span
                                key={`${datum.key}-label`}
                                className={styles.lineChartLabel}
                            >
                                {datum.key}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                    <span className={styles.legendLine} />
                    {legend}
                </div>
                <div className={styles.legendItem}>
                    <span className={styles.legendDashed} />
                    Average {units} {"("}
                    {Math.round(averageShifts)}
                    {")"}
                </div>
            </div>
        </div>
    );
};
