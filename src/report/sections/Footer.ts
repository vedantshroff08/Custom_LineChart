import { ReportData } from "../Types";

export function buildFooter(report: ReportData): string {

    return `
    <footer class="report-footer">

        ${report.footerText}

    </footer>
    `;
}