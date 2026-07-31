import { calculateStatistics } from "./Statistics";
import {
    ChartData,
    ReportData,
    ReportOptions
} from "./Types";

export function buildReport(
    chartData: ChartData,
    chartImage: string,
    options: ReportOptions
): ReportData {

    const statistics = calculateStatistics(chartData);

    return {
    title: options.title,
    companyName: options.companyName,
    generatedBy: options.generatedBy,
    generatedOn: new Date(),
    footerText: options.footerText,

    chartImage,

    chartData,

    statistics,

    logo: options.companyLogo,

    reportTheme: options.reportTheme,

    primaryColor: options.primaryColor,

    secondaryColor: options.secondaryColor
};
}