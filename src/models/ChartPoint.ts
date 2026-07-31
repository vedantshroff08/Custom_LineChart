export interface ChartPoint {

    label: string;

    value: number;

    // Parsed detail records for the drill-down modal (from the optional
    // jsonAttr per underlying row) — same shape as ModernPieChart's
    // PieSlice.records, not the raw Mendix ObjectItem.
    records: Record<string, unknown>[];
}