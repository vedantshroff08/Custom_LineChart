import { Chart } from "chart.js";

export function createGradient(
    chart: Chart,
    color: string
): CanvasGradient {

    const { ctx, chartArea } = chart;

    const gradient = ctx.createLinearGradient(
        0,
        chartArea.top,
        0,
        chartArea.bottom
    );

    gradient.addColorStop(0, color + "66");

    gradient.addColorStop(.4, color + "33");

    gradient.addColorStop(1, color + "00");

    return gradient;
}