import React, { ReactElement, createElement, useMemo, useRef, useState, useEffect } from "react";
import { ActionValue } from "mendix";
import { buildReport } from "../report/ReportEngine";
import { exportChartImage } from "../report/ChartExporter";
import { generatePdfReport, downloadPdf } from "../report/PdfExporter";
import { ChartPoint } from "../models/ChartPoint";
import { ChartSeriesData } from "../utils/ChartData";
import { shadeColor, hexToRgba } from "../utils/color";
import { DrillDownModal } from "./DrillDownModal";

function wrapTooltipText(text: string, maxCharsPerLine: number = 26, maxLines: number = 3): string[] {
    if (!text) return [];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length > maxCharsPerLine && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
        if (lines.length === maxLines) break;
    }
    if (currentLine && lines.length < maxLines) lines.push(currentLine);

    const consumedLength = lines.join(" ").length;
    if (consumedLength < text.length && lines.length === maxLines) {
        const lastIndex = lines.length - 1;
        lines[lastIndex] = lines[lastIndex].replace(/\s*\S*$/, "") + "…";
    }

    return lines;
}

function formatTooltipValue(rawValue: number | string, format?: string): string {
    const formattedNumber =
        typeof rawValue === "number" ? rawValue.toLocaleString() : String(rawValue);

    if (!format || !format.trim()) {
        return formattedNumber;
    }

    // Replace the {value} token with the formatted number.
    // If the user's format string doesn't include {value} at all,
    // fall back to just the plain number so nothing silently disappears.
    if (!format.includes("{value}")) {
        return formattedNumber;
    }

    return format.replace("{value}", formattedNumber);
}

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
    ChartData,
    ChartOptions
} from "chart.js";
import { Line } from "react-chartjs-2";
import { calculateStep } from "../utils/chartScale";
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);
export interface LineChartProps {
    chartTitle?: string;
    labels: string[];
    values: number[];
    series: ChartSeriesData[];
    height: number;
    legendName: string;
    lineColor: string;
    pointColor: string;
    gridColor: string;
    fontSize: number;
    lineWidth: number;
    pointRadius: number;
    legendPosition: "top" | "bottom" | "left" | "right";
    lineStyle: "solid" | "dashed" | "dotted";
    showGrid: boolean;
    showLegend: boolean;
    showTooltip: boolean;
    backgroundColor: string;
    smoothLine: boolean;
    fillArea: boolean;
    pointStyle: "circle" | "rect" | "triangle" | "star";
    gridThickness: number;
    showPoints: boolean;
    enableAnimation: boolean;
    animationDuration: number;
    hoverMode: "nearest" | "index" | "dataset";
    tooltipFormat?: string;
    enableReport: boolean;
    reportTitle: string;
    companyName: string;
    generatedBy: string;
    footerText: string;
    exportButtonText: string;
    generateReportAction?: ActionValue;
    companyLogo: string;
    reportTheme: string;
    primaryColor: string;
    secondaryColor: string;
    points: ChartPoint[];
}

export function LineChart(props: LineChartProps): ReactElement {

    const chartRef = useRef<ChartJS<"line"> | null>(null);
    const chartWrapRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isDarkTheme, setIsDarkTheme] = useState(
        document.body.classList.contains("dark-theme")
    );
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
    const [showModal, setShowModal] = useState(false);

    const filtered = { labels: props.labels, values: props.values };
    const chartSeries = props.series?.length
        ? props.series
        : [{
            label: props.legendName && props.legendName.trim().length > 0 ? props.legendName : "Series",
            values: props.values,
            color: props.lineColor
        }];

    const allSeriesValues = chartSeries.flatMap(series => series.values);
    const primarySeriesColor = chartSeries[0]?.color || props.lineColor;

    const exportBtnGradient = `linear-gradient(135deg, ${primarySeriesColor} 0%, ${shadeColor(primarySeriesColor, -18)} 100%)`;
    const exportBtnShadow = hexToRgba(primarySeriesColor, 0.28);
    const exportBtnShadowHover = hexToRgba(primarySeriesColor, 0.38);

    useEffect(() => {

        const observer = new MutationObserver(() => {

            const dark = document.body.classList.contains("dark-theme");

            setIsDarkTheme(dark);

        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => observer.disconnect();

    }, []);

    useEffect(() => {
        const container = chartWrapRef.current;
        if (!container) {
            return;
        }
        const observer = new ResizeObserver(() => {
            chartRef.current?.resize();
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    // Renders a modern, theme-aware HTML tooltip card instead of Chart.js's
    // default canvas-drawn tooltip. Chart.js still computes position/data via
    // its internal tooltip model (see `interaction`/`tooltip.mode` in options);
    // this handler only takes over the rendering + DOM positioning.
    const externalTooltipHandler = (context: any) => {
        const { chart, tooltip } = context;
        const tooltipEl = tooltipRef.current;
        if (!tooltipEl) {
            return;
        }

        if (tooltip.opacity === 0) {
            tooltipEl.style.opacity = "0";
            tooltipEl.style.pointerEvents = "none";
            return;
        }

        const dataPoints = tooltip.dataPoints || [];
        const titleRaw = (tooltip.title && tooltip.title[0]) || "";
        const titleLines = wrapTooltipText(String(titleRaw), 26, 2);

        let rowsHtml = "";
        dataPoints.forEach((dp: any) => {
            const color = dp.dataset.borderColor as string;
            const seriesLabel = dp.dataset.label || "Series";
            const formattedValue = formatTooltipValue(dp.parsed.y, props.tooltipFormat);

            // Trend vs. the previous point in the same series, when available.
            const idx = dp.dataIndex;
            const seriesData = dp.dataset.data as number[];
            let trendHtml = "";
            if (idx > 0 && typeof seriesData[idx] === "number" && typeof seriesData[idx - 1] === "number") {
                const diff = seriesData[idx] - seriesData[idx - 1];
                if (diff > 0) {
                    trendHtml = `<span class="mlc-tooltip-trend mlc-tooltip-trend-up">▲ ${diff.toLocaleString()}</span>`;
                } else if (diff < 0) {
                    trendHtml = `<span class="mlc-tooltip-trend mlc-tooltip-trend-down">▼ ${Math.abs(diff).toLocaleString()}</span>`;
                } else {
                    trendHtml = `<span class="mlc-tooltip-trend mlc-tooltip-trend-flat">— 0</span>`;
                }
            }

            rowsHtml += `
                <div class="mlc-tooltip-row">
                    <span class="mlc-tooltip-dot" style="background:${color}"></span>
                    <span class="mlc-tooltip-label">${seriesLabel}</span>
                    <span class="mlc-tooltip-value">${formattedValue}</span>
                    ${trendHtml}
                </div>`;
        });

        tooltipEl.innerHTML = `
            <div class="mlc-tooltip-title">${titleLines.join("<br/>")}</div>
            <div class="mlc-tooltip-body">${rowsHtml}</div>
        `;

        const { offsetLeft, offsetTop } = chart.canvas;
        tooltipEl.style.opacity = "1";
        tooltipEl.style.pointerEvents = "none";

        // Reset before measuring so offsetWidth/offsetHeight reflect the new content.
        tooltipEl.style.left = offsetLeft + tooltip.caretX + "px";
        tooltipEl.style.top = offsetTop + tooltip.caretY + "px";
        tooltipEl.classList.remove("mlc-tooltip-flip");

        const tooltipWidth = tooltipEl.offsetWidth;
        const tooltipHeight = tooltipEl.offsetHeight;
        const edgePadding = 8;

        // Clamp horizontally so the card never spills past the chart's left/right
        // edge (this is what was happening at the first/last data points, since
        // the card is centered on the point by default).
        const desiredLeft = offsetLeft + tooltip.caretX;
        const minLeft = offsetLeft + tooltipWidth / 2 + edgePadding;
        const maxLeft = offsetLeft + chart.width - tooltipWidth / 2 - edgePadding;
        const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
        const arrowOffset = desiredLeft - clampedLeft;

        // Flip below the point when there isn't enough room above it (top-most
        // points), instead of letting the card get cut off at the chart's top edge.
        const desiredTop = offsetTop + tooltip.caretY;
        const spaceAbove = desiredTop - offsetTop;
        const flip = spaceAbove < tooltipHeight + 20;
        if (flip) {
            tooltipEl.classList.add("mlc-tooltip-flip");
        }

        tooltipEl.style.left = clampedLeft + "px";
        tooltipEl.style.top = desiredTop + "px";
        tooltipEl.style.setProperty("--mlc-tooltip-arrow-offset", `${arrowOffset}px`);
    };

    const buildReportOptions = () => ({
        title: props.reportTitle || "Line Chart Report",
        generatedBy: props.generatedBy || "",
        companyName: props.companyName || "",
        footerText: props.footerText || "Generated using ModernLineChart",

        companyLogo: props.companyLogo || "",
        reportTheme: props.reportTheme || "corporate",
        primaryColor: props.primaryColor || "",
        secondaryColor: props.secondaryColor || "",

        includeChart: true,
        includeStatistics: true,
        includeTable: true
    });

    const handleDownloadPdf = async () => {
        if (!chartRef.current || isExportingPdf) {
            return;
        }
        setIsExportingPdf(true);
        try {
            const chartImage = exportChartImage(chartRef.current);
            const report = buildReport(
                {
                    labels: filtered.labels,
                    values: filtered.values
                },
                chartImage,
                buildReportOptions()
            );
            const pdfBytes = await generatePdfReport(report);
            downloadPdf(pdfBytes, report.title || "line-chart-report");
        } finally {
            setIsExportingPdf(false);
        }
    };

    const maxValue =
        allSeriesValues.length > 0
            ? Math.max(...allSeriesValues)
            : 0;

    const data: ChartData<"line"> = useMemo(
        () => ({
            labels: filtered.labels,
            datasets: chartSeries.map((series, seriesIndex) => {
                const seriesColor = series.color || props.lineColor;

                return {
                    clip: 10,
                    borderCapStyle: "round",
                    borderJoinStyle: "round",
                    label: series.label || `Series ${seriesIndex + 1}`,
                    cubicInterpolationMode: "monotone",
                    data: series.values,
                    borderColor: seriesColor,
                    borderWidth: props.lineWidth,
                    borderDash:
                        props.lineStyle === "dashed"
                            ? [8, 4]
                            : props.lineStyle === "dotted"
                                ? [2, 4]
                                : [],
                    fill: props.fillArea,
                    pointRadius: props.showPoints ? props.pointRadius : 0,
                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: props.pointColor,
                    pointHoverBorderColor: seriesColor,
                    pointHoverRadius: props.showPoints ? props.pointRadius + 3 : 0,
                    pointStyle: props.pointStyle,
                    pointHitRadius: 20,
                    pointBackgroundColor: props.pointColor,
                    pointBorderColor: seriesColor,
                    pointBorderWidth: 2,
                    tension: props.smoothLine ? 0.4 : 0,
                    backgroundColor: context => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            return seriesColor + "22";
                        }

                        const gradient = ctx.createLinearGradient(
                            0,
                            chartArea.top,
                            0,
                            chartArea.bottom
                        );

                        gradient.addColorStop(0, seriesColor + "55");
                        gradient.addColorStop(0.6, seriesColor + "22");
                        gradient.addColorStop(1, seriesColor + "00");

                        return gradient;
                    }
                };
            })
        }),
        [chartSeries, filtered.labels, props]
    );

    const handlePointClick = (
        _: unknown,
        elements: any[]
    ) => {

        if (!elements.length) {
            return;
        }

        const index = elements[0].index;

        const point = props.points[index];

        setSelectedPoint(point);
        setShowModal(true);

    };
    // X-axis labels get their own (smaller) font size so long category names take up less
    // horizontal room per tick, which leaves more space for wrapping/fitting every label.
    const xTickFontSize = Math.max(9, Math.min(props.fontSize, 11));
    const options: ChartOptions<"line"> = {
        responsive: true,

        maintainAspectRatio: false,
        onClick: handlePointClick,

        animation: props.enableAnimation
            ? {
                duration: props.animationDuration && props.animationDuration > 0
                    ? props.animationDuration
                    : 800,
                easing: "easeOutQuart"
            }
            : false,
        interaction: {
            mode: props.hoverMode,

            intersect: false,

            axis: "x"
        },

        plugins: {
            legend: {

                display: props.showLegend,

                position: props.legendPosition,

                labels: {

                    usePointStyle: true,

                    pointStyle: "circle",

                    boxWidth: 10,

                    boxHeight: 10,

                    padding: 18,

                    color: isDarkTheme ? "#CBD5E1" : "#475569",

                    font: {

                        size: props.fontSize,

                        weight: "bold"
                    }

                }

            },
            tooltip: {
                enabled: false,
                external: props.showTooltip ? externalTooltipHandler : undefined
            }
        },
        scales: {
            x: {
                grid: {
                    display: props.showGrid,
                    lineWidth: props.gridThickness,
                    color: context => {
                        return context.tick.value === 0
                            ? (isDarkTheme ? "#475569" : "#D1D5DB")
                            : (isDarkTheme ? "#334155" : props.gridColor);
                    }
                },

                ticks: {
                    // autoSkip is off on purpose: with wrapped multi-line labels, Chart.js's
                    // autoSkip estimate of label width is unreliable and was hiding labels for
                    // categories that do have data. Instead we size each label to the space it
                    // actually has, so every category gets a (possibly shorter) visible label.
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    color: isDarkTheme ? "#CBD5E1" : "#64748B",
                    font: {
                        size: xTickFontSize
                    },
                    callback(value) {
                        const rawLabel = this.getLabelForValue(value as number);
                        const numTicks = Math.max(filtered.labels.length, 1);
                        const chartWidth = this.chart?.width || 600;
                        // Rough px-per-tick budget, minus a little padding so neighboring
                        // labels don't visually touch.
                        const perTickWidth = Math.max(chartWidth / numTicks - 6, 24);
                        const approxCharWidth = xTickFontSize * 0.62;
                        const maxCharsPerLine = Math.max(
                            5,
                            Math.floor(perTickWidth / approxCharWidth)
                        );
                        // Allow up to 3 stacked lines (instead of 2) so labels wrap down
                        // rather than needing to be cut off horizontally.
                        return wrapTooltipText(String(rawLabel), maxCharsPerLine, 3);
                    }
                },
            },
            y: {
                beginAtZero: true,

                suggestedMax:
                    Math.ceil(maxValue / calculateStep(allSeriesValues)) *
                    calculateStep(allSeriesValues),
                grid: {
                    display: props.showGrid,

                    lineWidth: props.gridThickness || 1,

                    color: context => {
                        return context.tick.value === 0
                            ? "#D1D5DB"
                            : props.gridColor;
                    }
                },

                ticks: {

                    precision: 0,

                    stepSize: calculateStep(allSeriesValues),

                    color: isDarkTheme ? "#CBD5E1" : "#64748B",

                    font: {

                        size: props.fontSize

                    },

                    callback(value) {

                        return Number(value).toFixed(0);

                    }

                },
            }
        }
    };

    return (
        <div className="mlc-card" style={{ height: `${props.height}px` }}>
            {(props.chartTitle || props.enableReport) && (
                <div className="mlc-toolbar">
                    {props.chartTitle && (
                        <h3 className="mlc-title" style={{ color: isDarkTheme ? "#F4F4F5" : undefined }}>
                            {props.chartTitle}
                        </h3>
                    )}
                    {props.enableReport && (
                        <div className="mlc-toolbar-actions">
                            <button
                                type="button"
                                className="mlc-export-btn mlc-export-btn-pdf"
                                onClick={handleDownloadPdf}
                                disabled={isExportingPdf}
                                style={{
                                    ["--mlc-export-gradient" as string]: exportBtnGradient,
                                    ["--mlc-export-shadow" as string]: exportBtnShadow,
                                    ["--mlc-export-shadow-hover" as string]: exportBtnShadowHover
                                } as React.CSSProperties}
                            >
                                <span className="mlc-export-icon">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 3V15M12 15L7 10M12 15L17 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 17V18.5C4 19.8807 5.11929 21 6.5 21H17.5C18.8807 21 20 19.8807 20 18.5V17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className="mlc-export-text">
                                    {isExportingPdf ? "Generating…" : "Generate Report"}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="mlc-chart" ref={chartWrapRef}>
                <Line ref={chartRef} data={data} options={options} />
                <div
                    ref={tooltipRef}
                    className={`mlc-tooltip${isDarkTheme ? " mlc-tooltip-dark" : ""}`}
                />
            </div>

            <DrillDownModal
                open={showModal}
                title={selectedPoint?.label ?? ""}
                records={selectedPoint?.records ?? []}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}