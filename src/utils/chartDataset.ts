import { Chart, ChartDataset } from "chart.js";

export interface DatasetOptions {
    values: number[];

    lineColor: string;
    pointColor: string;

    lineWidth: number;
    pointRadius: number;

    fillArea: boolean;
    smoothLine: boolean;
}

export function createDataset(
    chart: Chart | undefined,
    options: DatasetOptions
): ChartDataset<"line"> {

    let background: string | CanvasGradient = "transparent";

    if (options.fillArea && chart?.chartArea) {
        const gradient = chart.ctx.createLinearGradient(
            0,
            chart.chartArea.top,
            0,
            chart.chartArea.bottom
        );

        gradient.addColorStop(0, options.lineColor + "55");
        gradient.addColorStop(0.6, options.lineColor + "22");
        gradient.addColorStop(1, options.lineColor + "00");

        background = gradient;
    }

    return {
        label: "Value",

        data: options.values,

        borderColor: options.lineColor,

        backgroundColor: background,

        borderWidth: options.lineWidth,

        fill: options.fillArea,

        tension: options.smoothLine ? 0.4 : 0,

        cubicInterpolationMode: "monotone",

        borderCapStyle: "round",

        borderJoinStyle: "round",

        pointRadius: options.pointRadius,

        pointHoverRadius: options.pointRadius + 5,

        pointHitRadius: 20,

        pointHoverBorderWidth: 3,

        pointBackgroundColor: options.pointColor,

        pointHoverBackgroundColor: options.pointColor,

        pointBorderColor: options.lineColor,

        pointBorderWidth: 2
    };
}