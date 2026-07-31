import { ReportData } from "../Types";

export function buildHeader(report: ReportData): string {

    const logo = report.logo
        ? `
        <img
            class="company-logo"
            src="${report.logo}"
            alt="Company Logo">
        `
        : "";

    return `

<div class="card">

    <div class="report-header">

        <div class="header-left">

            ${logo}

            <div>

                <div class="report-title">
                    ${report.title}
                </div>

                <div class="report-company">
                    ${report.companyName}
                </div>

            </div>

        </div>

    </div>

</div>

`;
}