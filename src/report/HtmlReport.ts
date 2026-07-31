import { ReportData } from "./Types";
import { reportStyles } from "./ReportStyles";
import { buildInfoCards } from "./sections/InfoCards";
import { buildHeader } from "./sections/Header";
import { buildChart } from "./sections/Chart";
import { buildKpiCards } from "./sections/KpiCards";
import { buildDataTable } from "./sections/DataTable";
import { buildFooter } from "./sections/Footer";
import { buildExecutiveSummary } from "./sections/ExecutiveSummary";
import { getTheme } from "./ThemeManager";

export function openHtmlReport(report: ReportData): void {

    const theme = getTheme(
        report.reportTheme,
        report.primaryColor,
        report.secondaryColor
    );

    const html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>${report.title}</title>

<style>

${reportStyles(theme)}

</style>

</head>

<body>

<div class="toolbar">

    <div class="toolbar-left">

        <div class="toolbar-title">

            📄 Report Preview

        </div>

    </div>

    <div class="toolbar-right">

        <button
            class="toolbar-button print"
            onclick="window.print()">

            🖨 Print

        </button>
    </div>

</div>

<div class="report theme-${report.reportTheme}">

${buildHeader(report)}

${buildExecutiveSummary(report)}

${buildInfoCards(report)}

${buildChart(report)}

${buildKpiCards(report)}

${buildDataTable(report)}

${buildFooter(report)}

</div>

<script>

function downloadReport(){

    const html =
        document.documentElement.outerHTML;

    const blob =
        new Blob(
            [html],
            {
                type:"text/html"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "${report.title.replace(/[^a-zA-Z0-9]/g,"_")}.html";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

</script>

</body>

</html>
`;

    const reportWindow = window.open(
        "",
        "_blank",
        "width=1400,height=900,resizable=yes,scrollbars=yes"
    );

    if (!reportWindow) {
        return;
    }

    reportWindow.document.open();
    reportWindow.document.write(html);
    reportWindow.document.close();
}