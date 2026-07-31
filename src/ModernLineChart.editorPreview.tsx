
import React, { ReactElement, createElement } from "react";


export function preview(): ReactElement {
    return (
        <div
            style={{
                padding: 20,
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                background: "#FFFFFF",
                color: "#6B7280",
                textAlign: "center"
            }}
        >
            Modern Line Chart
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ModernLineChart.css");
}
