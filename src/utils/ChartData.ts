import { Big } from "big.js";
import { ListAttributeValue, ListValue } from "mendix";
import { ChartPoint } from "../models/ChartPoint";

export interface ChartSeriesConfig {
    attribute?: ListAttributeValue<Big>;
    name?: string;
    color?: string;
}

export interface ChartSeriesData {
    label: string;
    values: number[];
    color: string;
}

export interface ChartDataModel {
    labels: string[];
    values: number[];
    points: ChartPoint[];
    series: ChartSeriesData[];
}

const DEFAULT_SERIES_COLORS = [
    "#4F46E5",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6"
];

export function buildChartData(
    dataSource: ListValue,
    xAttribute: ListAttributeValue<string>,
    yAttribute?: ListAttributeValue<Big>,
    jsonAttribute?: ListAttributeValue<string>,
    seriesConfig: ChartSeriesConfig[] = []
): ChartDataModel {
    if (!dataSource.items) {
        return { labels: [], values: [], points: [], series: [] };
    }

    // New multi-series configuration. If no series are configured, fall back
    // to the original yAttribute so existing widget instances keep working.
    const configuredSeries = seriesConfig
        .filter(series => !!series.attribute)
        .map((series, index) => ({
            attribute: series.attribute!,
            name: series.name?.trim() || `Series ${index + 1}`,
            color: series.color?.trim() || DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length]
        }));

    if (configuredSeries.length === 0 && yAttribute) {
        configuredSeries.push({
            attribute: yAttribute,
            name: "Series",
            color: DEFAULT_SERIES_COLORS[0]
        });
    }

    const grouped = new Map<string, { point: ChartPoint; values: number[] }>();

    dataSource.items.forEach(item => {
        const label = xAttribute.get(item).displayValue ?? "";

        if (!grouped.has(label)) {
            grouped.set(label, {
                point: { label, value: 0, records: [] },
                values: configuredSeries.map(() => 0)
            });
        }

        const groupedPoint = grouped.get(label)!;

        configuredSeries.forEach((series, seriesIndex) => {
            const value = Number(series.attribute.get(item).value ?? 0);
            groupedPoint.values[seriesIndex] += Number.isFinite(value) ? value : 0;
        });

        // Keep the original drill-down behavior. Records belong to the X-axis
        // category and can be opened regardless of which series was clicked.
        if (jsonAttribute) {
            const json = jsonAttribute.get(item).value;
            if (json) {
                try {
                    const parsed = JSON.parse(json);
                    if (Array.isArray(parsed)) {
                        groupedPoint.point.records.push(...parsed);
                    } else if (parsed && typeof parsed === "object") {
                        groupedPoint.point.records.push(parsed);
                    }
                } catch (error) {
                    console.error(`Invalid JSON for point "${label}"`, error);
                }
            }
        }

        // Preserve the legacy ChartPoint value as the first series value.
        groupedPoint.point.value = groupedPoint.values[0] ?? 0;
    });

    const groupedPoints = Array.from(grouped.values());
    const labels = groupedPoints.map(({ point }) => point.label);
    const points = groupedPoints.map(({ point }) => point);

    const series: ChartSeriesData[] = configuredSeries.map((config, seriesIndex) => ({
        label: config.name,
        color: config.color,
        values: groupedPoints.map(group => group.values[seriesIndex] ?? 0)
    }));

    return {
        labels,
        values: series[0]?.values ?? [],
        points,
        series
    };
}
