import { ReportData } from "../Types";

export function buildExecutiveSummary(report: ReportData): string {

    const s = report.statistics;

    return `

<div class="summary card">

<h2>📈 Executive Summary</h2>

<p>

This report contains
<strong>${s.count}</strong>
observations.

The highest value recorded is
<strong>${s.maximum}</strong>
during
<strong>${s.maximumLabel}</strong>.

The average value is
<strong>${s.average.toFixed(2)}</strong>.

Overall growth is
<strong>${s.growth.toFixed(2)}%</strong>.

The overall trend is
<strong>${s.trend}</strong>.

</p>

</div>

`;

}