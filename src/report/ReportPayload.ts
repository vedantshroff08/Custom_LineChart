import { ReportData } from "./Types";

export function createReportPayload(report: ReportData): string {
    return JSON.stringify(
        {
            metadata: {
                title: report.title,
                company: report.companyName ?? "",
                generatedBy: report.generatedBy ?? "",
                generatedOn: report.generatedOn.toISOString(),
                footer: report.footerText ?? ""
            },

            statistics: report.statistics,

            chart: {
                image: report.chartImage ?? "",
                labels: report.chartData.labels,
                values: report.chartData.values
            }
        },
        null,
        2
    );
}