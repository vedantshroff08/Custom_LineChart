/**
 * This file was generated from ModernLineChart.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ActionValue, ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export interface SeriesType {
    name: string;
    attribute: ListAttributeValue<Big>;
    color: string;
}

export type LegendPositionEnum = "top" | "bottom" | "left" | "right";

export type ThemeEnum = "indigo" | "azure" | "emerald" | "violet" | "amber" | "rose" | "slate" | "dark" | "custom";

export type HoverModeEnum = "nearest" | "index" | "dataset";

export type LineStyleEnum = "solid" | "dashed" | "dotted";

export type PointStyleEnum = "circle" | "rect" | "triangle" | "star";

export type ReportThemeEnum = "corporate" | "emerald" | "purple" | "dark" | "custom";

export interface SeriesPreviewType {
    name: string;
    attribute: string;
    color: string;
}

export interface ModernLineChartContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource: ListValue;
    xAttribute: ListAttributeValue<string>;
    yAttribute?: ListAttributeValue<Big>;
    series: SeriesType[];
    jsonAttr?: ListAttributeValue<string>;
    chartTitle: string;
    xAxisLabel: string;
    yAxisLabel: string;
    height: number;
    fillArea: boolean;
    showPoints: boolean;
    showGrid: boolean;
    legendName: string;
    showLegend: boolean;
    legendPosition: LegendPositionEnum;
    smoothLine: boolean;
    theme: ThemeEnum;
    hoverMode: HoverModeEnum;
    enableAnimation: boolean;
    animationDuration: number;
    tooltipFormat: string;
    showTooltip: boolean;
    lineColor: string;
    pointColor: string;
    gridColor: string;
    backgroundColor: string;
    lineWidth: number;
    pointRadius: number;
    customClass: string;
    fontSize: number;
    gridThickness: number;
    borderRadius: number;
    shadow: boolean;
    padding: number;
    lineStyle: LineStyleEnum;
    pointStyle: PointStyleEnum;
    enableReport: boolean;
    reportTitle: string;
    companyName: string;
    generatedBy: string;
    footerText: string;
    exportButtonText: string;
    generateReportAction?: ActionValue;
    companyLogo: string;
    reportTheme: ReportThemeEnum;
    primaryColor: string;
    secondaryColor: string;
}

export interface ModernLineChartPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    dataSource: {} | { caption: string } | { type: string } | null;
    xAttribute: string;
    yAttribute: string;
    series: SeriesPreviewType[];
    jsonAttr: string;
    chartTitle: string;
    xAxisLabel: string;
    yAxisLabel: string;
    height: number | null;
    fillArea: boolean;
    showPoints: boolean;
    showGrid: boolean;
    legendName: string;
    showLegend: boolean;
    legendPosition: LegendPositionEnum;
    smoothLine: boolean;
    theme: ThemeEnum;
    hoverMode: HoverModeEnum;
    enableAnimation: boolean;
    animationDuration: number | null;
    tooltipFormat: string;
    showTooltip: boolean;
    lineColor: string;
    pointColor: string;
    gridColor: string;
    backgroundColor: string;
    lineWidth: number | null;
    pointRadius: number | null;
    customClass: string;
    fontSize: number | null;
    gridThickness: number | null;
    borderRadius: number | null;
    shadow: boolean;
    padding: number | null;
    lineStyle: LineStyleEnum;
    pointStyle: PointStyleEnum;
    enableReport: boolean;
    reportTitle: string;
    companyName: string;
    generatedBy: string;
    footerText: string;
    exportButtonText: string;
    generateReportAction: {} | null;
    companyLogo: string;
    reportTheme: ReportThemeEnum;
    primaryColor: string;
    secondaryColor: string;
}
