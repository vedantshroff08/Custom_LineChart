import { Chart } from "chart.js";

export function exportChartImage(
    chart: Chart<"line">
): string {

    const canvas = chart.canvas;

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    // High resolution for reports
    canvas.width = 1400;
    canvas.height = 700;

    chart.resize(1400,700);

    chart.update("none");

    const image = chart.toBase64Image();

    // Restore
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    chart.resize();

    chart.update("none");

    return image;
}
