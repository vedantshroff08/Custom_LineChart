import { ChartData, ReportStatistics } from "./Types";

export function calculateStatistics(data: ChartData): ReportStatistics {
    const { labels, values } = data;

    if (!values || values.length === 0) {
        return {
            total: 0,
            average: 0,
            minimum: 0,
            maximum: 0,
            minimumLabel: "",
            maximumLabel: "",
            count: 0,
            growth: 0,
            median: 0,
            variance: 0,
            standardDeviation: 0,
            trend: "Stable"
        };
    }

    const count = values.length;

    const total = values.reduce((sum, value) => sum + value, 0);

    const average = total / count;

    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    const minimumIndex = values.indexOf(minimum);
    const maximumIndex = values.indexOf(maximum);

    const minimumLabel = labels[minimumIndex] ?? "";
    const maximumLabel = labels[maximumIndex] ?? "";

    // Growth Calculation
    const firstValue = values[0];
    const lastValue = values[count - 1];

    const growth =
        firstValue === 0
            ? 0
            : ((lastValue - firstValue) / firstValue) * 100;

    // Median
    const sorted = [...values].sort((a, b) => a - b);

    const median =
        count % 2 === 0
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
            : sorted[Math.floor(count / 2)];

    // Variance
    const variance =
        values.reduce((sum, value) => {
            return sum + Math.pow(value - average, 2);
        }, 0) / count;

    // Standard Deviation
    const standardDeviation = Math.sqrt(variance);

    // Trend Detection
    let trend = "Stable";

    if (growth > 5) {
        trend = "Increasing";
    } else if (growth < -5) {
        trend = "Decreasing";
    }

    return {
        total,
        average,
        minimum,
        maximum,
        minimumLabel,
        maximumLabel,
        count,
        growth,
        median,
        variance,
        standardDeviation,
        trend
    };
}