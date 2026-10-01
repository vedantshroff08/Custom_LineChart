import React, { ReactElement, createElement } from "react";
import { ModernLineChartContainerProps } from "../typings/ModernLineChartProps";
import { buildChartData } from "./utils/ChartData";
import { LineChart } from "./components/LineChart";
import { themes } from "./utils/theme";
import "./ui/ModernLineChart.css";


export function ModernLineChart(props: ModernLineChartContainerProps): ReactElement {

    const selectedTheme =
        props.theme !== "custom"
            ? themes[props.theme]
            : null;
    const lineColor =
        selectedTheme?.lineColor || props.lineColor || "#4F46E5";

    const pointColor =
        selectedTheme?.pointColor || props.pointColor || "#FFFFFF";

    const gridColor =
        selectedTheme?.gridColor || props.gridColor || "#E5E7EB";

    const backgroundColor =
        selectedTheme?.backgroundColor || props.backgroundColor || "#FFFFFF";
    const chartData = buildChartData(
        props.dataSource,
        props.xAttribute,
        props.yAttribute,
        props.jsonAttr,
        props.series
    );

    if (chartData.values.length === 0) {
        return (
            <div className="modern-line-chart empty">
                <div className="modern-line-chart-empty-icon">
                    📈
                </div>

                <div className="modern-line-chart-message">
                    No data available
                </div>

                <div className="modern-line-chart-subtitle">
                    Select a datasource containing records.
                </div>
            </div>
        );
    }
    if (props.dataSource.status === "loading") {
        return (
            <div className="modern-line-chart loading">
                <div className="modern-line-chart-loader"></div>
                <div className="modern-line-chart-message">
                    Loading chart...
                </div>
            </div>
        );
    }
    return (
        <div
            className={["mlc-container", props.customClass].filter(Boolean).join(" ")}
            style={{
                borderRadius: props.borderRadius || 20,
                padding: props.padding || 20,
                boxShadow: props.shadow
                    ? "0 10px 30px rgba(15, 23, 42, 0.08)"
                    : "none"
            }}
        >
            <div className="modern-line-chart-body">
                <LineChart
                    chartTitle={props.chartTitle}
                    showPoints={props.showPoints}
                    enableAnimation={props.enableAnimation}
                    animationDuration={props.animationDuration}
                    hoverMode={props.hoverMode}
                    tooltipFormat={props.tooltipFormat}
                    gridThickness={props.gridThickness}
                    pointStyle={props.pointStyle}
                    lineStyle={props.lineStyle}
                    legendName={props.legendName}
                    fontSize={props.fontSize || 12}
                    legendPosition={props.legendPosition}
                    labels={chartData.labels}
                    backgroundColor={backgroundColor}
                    values={chartData.values}
                    series={chartData.series}
                    lineColor={lineColor}
                    pointColor={pointColor}
                    gridColor={gridColor}
                    lineWidth={Number(props.lineWidth || "3")}
                    pointRadius={Number(props.pointRadius || "4")}
                    showGrid={props.showGrid}
                    showLegend={props.showLegend}
                    showTooltip={props.showTooltip}
                    smoothLine={props.smoothLine}
                    fillArea={props.fillArea}
                    enableReport={props.enableReport}
                    reportTitle={props.reportTitle}
                    companyName={props.companyName}
                    height={props.height}
                    generatedBy={props.generatedBy}
                    footerText={props.footerText}
                    exportButtonText={props.exportButtonText}
                    generateReportAction={props.generateReportAction}
                    companyLogo={props.companyLogo}
                    reportTheme={props.reportTheme}
                    primaryColor={props.primaryColor}
                    secondaryColor={props.secondaryColor}
                    points={chartData.points}
                />
            </div>
        </div>
    );
}