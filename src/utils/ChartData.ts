import { Big } from "big.js";
import { ListAttributeValue, ListValue } from "mendix";
import { ChartPoint } from "../models/ChartPoint";

export interface ChartDataModel {
    labels: string[];
    values: number[];
    points: ChartPoint[];
}

export function buildChartData(
    dataSource: ListValue,
    xAttribute: ListAttributeValue<string>,
    yAttribute: ListAttributeValue<Big>,
    jsonAttribute?: ListAttributeValue<string>
): ChartDataModel {
    const grouped = new Map<string, ChartPoint>();
    if (!dataSource.items) {
        return {
            labels: [],
            values: [],
            points: []
        };
    }
    dataSource.items.forEach(item => {

        const label = xAttribute.get(item).displayValue ?? "";

        const value = Number(yAttribute.get(item).value ?? 0);

        if (!grouped.has(label)) {

            grouped.set(label, {
                label,
                value: 0,
                records: []
            });

        }

        const point = grouped.get(label)!;

        point.value += value;

        // Parse the optional detail JSON into plain records for the
        // drill-down modal (same pattern as ModernPieChart's transformToSlices).
        // Supports either a single JSON object or an array of objects per row.
        if (jsonAttribute) {
            const json = jsonAttribute.get(item).value;
            if (json) {
                try {
                    const parsed = JSON.parse(json);
                    if (Array.isArray(parsed)) {
                        point.records.push(...parsed);
                    } else if (parsed && typeof parsed === "object") {
                        point.records.push(parsed);
                    }
                } catch (error) {
                    console.error(`Invalid JSON for point "${label}"`, error);
                }
            }
        }

    });

    const points = Array.from(grouped.values());

    return {
        labels: points.map(point => point.label),
        values: points.map(point => point.value),
        points
    };
}
