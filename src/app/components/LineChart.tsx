import { useMemo } from "react";
import styles from "./LineChart.module.css";

type MonthlyShiftDatum = {
    dateKey: string;
    monthLabel: string;
    shiftTime: number;
    bagelsDelivered: number;
    bagelsReceived: number;
    totalShifts: number;
};

interface LineChartProps {
    legend: string;
    units: string;
    monthlyChartData: MonthlyShiftDatum[];
}

export const LineChart = ({
    legend,
    units,
    monthlyChartData,
}: LineChartProps) => {
    const maxMonthlyShifts = Math.max(
        ...monthlyChartData.map((datum) => datum.totalShifts),
        1
    );

    const chartLinePoints = useMemo(() => {
        if (monthlyChartData.length === 0) {
            return "";
        }

        return monthlyChartData
            .map((datum, index) => {
                const x =
                    monthlyChartData.length === 1
                        ? 50
                        : (index / (monthlyChartData.length - 1)) * 196 - 48;
                const y = 100 - (datum.totalShifts / maxMonthlyShifts) * 87;

                return `${x},${y}`;
            })
            .join(" ");
    }, [maxMonthlyShifts, monthlyChartData]);

    const averageShifts = Math.round(
        monthlyChartData.reduce(
            (total, datum) => total + datum.totalShifts,
            0
        ) / monthlyChartData.length
    );

    const averageLineY = Math.round(
        100 - (averageShifts / maxMonthlyShifts) * 87
    );

    return (
        <div className={styles.chartCard}>
            <header className={styles.chartHeader}>
                <h3 className={styles.sectionTitle}>Monthly shifts</h3>
            </header>

            <div className={styles.chartContent}>
                <div className={styles.yAxis}>
                    <div className={styles.yLabel}>{units}</div>
                    <div className={styles.yScale}>
                        <span className={styles.yTick}>{maxMonthlyShifts}</span>
                        <span
                            className={styles.yTick}
                            style={{
                                position: "relative",
                                top: `-${
                                    (averageShifts / maxMonthlyShifts - 0.5) *
                                    74
                                }px`,
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
                                    x1="-100"
                                    y1={averageLineY}
                                    x2="200"
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
                            {monthlyChartData.map((datum, index) => {
                                const x =
                                    monthlyChartData.length === 1
                                        ? 50
                                        : (index /
                                              (monthlyChartData.length - 1)) *
                                              196 -
                                          48;
                                const y =
                                    100 -
                                    (datum.totalShifts / maxMonthlyShifts) * 87;

                                return (
                                    <g key={`${datum.dateKey}-point`}>
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
                                            {datum.totalShifts}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* X-axis labels at the bottom */}
                    <div className={styles.lineChartLabels}>
                        {monthlyChartData.map((datum) => (
                            <span
                                key={`${datum.dateKey}-label`}
                                className={styles.lineChartLabel}
                            >
                                {datum.monthLabel}
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
                    {Math.round(10)}
                    {")"}
                </div>
            </div>
        </div>
    );
};
