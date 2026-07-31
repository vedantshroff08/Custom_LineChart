import React, { ReactElement, createElement, useMemo, useRef, useState, useEffect } from "react";
import { ActionValue } from "mendix";
import { buildReport } from "../report/ReportEngine";
import { exportChartImage } from "../report/ChartExporter";
import { generatePdfReport, downloadPdf } from "../report/PdfExporter";
import { ChartPoint } from "../models/ChartPoint";
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
    const [isDarkTheme, setIsDarkTheme] = useState(
        document.body.classList.contains("dark-theme")
    );
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);
    const [showModal, setShowModal] = useState(false);

    const exportBtnGradient = `linear-gradient(135deg, ${props.lineColor} 0%, ${shadeColor(props.lineColor, -18)} 100%)`;
    const exportBtnShadow = hexToRgba(props.lineColor, 0.28);
    const exportBtnShadowHover = hexToRgba(props.lineColor, 0.38);

    const filtered = { labels: props.labels, values: props.values };
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
        filtered.values.length > 0
            ? Math.max(...filtered.values)
            : 0;


    const data: ChartData<"line"> = useMemo(
        () => ({


            labels: filtered.labels,
            datasets: [
                {
                    clip: 10,

                    borderCapStyle: "round",

                    borderJoinStyle: "round",

                    label:
                        props.legendName && props.legendName.trim().length > 0
                            ? props.legendName
                            : "Series",

                    cubicInterpolationMode: "monotone",

                    data: filtered.values,
                    borderColor: props.lineColor,

                    borderWidth: props.lineWidth,
                    borderDash:
                        props.lineStyle === "dashed"
                            ? [8, 4]
                            : props.lineStyle === "dotted"
                                ? [2, 4]
                                : [],

                    fill: props.fillArea,

                    pointRadius: props.showPoints
                        ? props.pointRadius
                        : 0,

                    pointHoverBorderWidth: 3,
                    pointHoverBackgroundColor: props.pointColor,
                    pointHoverBorderColor: props.lineColor,

                    pointHoverRadius: props.showPoints
                        ? props.pointRadius + 3
                        : 0,
                    pointStyle: props.pointStyle,

                    pointHitRadius: 20,

                    pointBackgroundColor: props.pointColor,

                    pointBorderColor: props.lineColor,

                    pointBorderWidth: 2,

                    tension: props.smoothLine ? 0.4 : 0,



                    backgroundColor: context => {

                        const chart = context.chart;

                        const { ctx, chartArea } = chart;

                        if (!chartArea) {
                            return props.lineColor + "22";
                        }

                        const gradient = ctx.createLinearGradient(
                            0,
                            chartArea.top,
                            0,
                            chartArea.bottom
                        );

                        gradient.addColorStop(0, props.lineColor + "55");

                        gradient.addColorStop(.6, props.lineColor + "22");

                        gradient.addColorStop(1, props.lineColor + "00");

                        return gradient;

                    }

                }]
        }),
        [props, filtered]
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
                enabled: props.showTooltip,

                backgroundColor: isDarkTheme
                    ? "rgba(15,23,42,0.95)"
                    : "rgba(17,24,39,0.95)",

                titleColor: isDarkTheme
                    ? "#F8FAFC"
                    : "#F9FAFB",

                bodyColor: isDarkTheme
                    ? "#CBD5E1"
                    : "#E5E7EB",

                displayColors: true, // show the color swatch per dataset - adds visual interest
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 6,
                usePointStyle: true, // renders swatch as a circle instead of a square

                borderColor: "rgba(99, 102, 241, 0.4)", // subtle indigo accent border
                borderWidth: 1,

                cornerRadius: 12,
                padding: 12,
                caretSize: 8,
                caretPadding: 8,

                titleFont: {
                    size: (props.fontSize || 12) + 1,
                    weight: "bold",
                    family: "'Inter', sans-serif",
                    lineHeight: 1.3
                },

                bodyFont: {
                    size: props.fontSize || 12,
                    family: "'Inter', sans-serif"
                },

                // Adds spacing/hierarchy between title and body
                titleMarginBottom: 8,
                bodySpacing: 6,

                callbacks: {
                    // Wraps long labels into stacked lines instead of one overflowing line
                    title: function (items: any[]) {
                        if (!items.length) return [];
                        const raw = items[0].label ?? "";
                        return wrapTooltipText(String(raw), 26);
                    },
                    // Bold value formatting with unit, e.g. "1,234 units"
                    label: function (context: any) {
                        const label = context.dataset.label || '';
                        const value = typeof context.parsed.y === 'number'
                            ? context.parsed.y.toLocaleString()
                            : context.parsed.y;
                        return ` ${label}: ${value}`;
                    }
                },
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
                    Math.ceil(maxValue / calculateStep(filtered.values)) *
                    calculateStep(filtered.values),
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

                    stepSize: calculateStep(filtered.values),

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
        <div className="mlc-card">
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

            <div className="mlc-chart" ref={chartWrapRef} style={{ height: `${props.height}px` }}>
                <Line ref={chartRef} data={data} options={options} />
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