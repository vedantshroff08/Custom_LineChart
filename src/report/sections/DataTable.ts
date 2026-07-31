import { ReportData } from "../Types";

export function buildDataTable(report: ReportData): string {

    const rows = report.chartData.labels.map((label, index) => {

        const value = report.chartData.values[index];

        const previous =
            index === 0
                ? null
                : report.chartData.values[index - 1];

        let change = "-";
        let trend = "➖";

        if (previous !== null && previous !== 0) {

            const growth = ((value - previous) / previous) * 100;

            change = `${growth.toFixed(2)}%`;

            if (growth > 0) {
                trend = "🟢";
            } else if (growth < 0) {
                trend = "🔴";
            } else {
                trend = "⚪";
            }
        }

        return `

<tr>

<td>${index + 1}</td>

<td>${label}</td>

<td>${value}</td>

<td>${change}</td>

<td>${trend}</td>

</tr>

`;

    }).join("");

    return `

<section class="card">

<h2 class="section-title">

Data Analysis

</h2>

<table>

<thead>

<tr>

<th>#</th>

<th>Label</th>

<th>Value</th>

<th>Change</th>

<th>Trend</th>

</tr>

</thead>

<tbody>

${rows}

</tbody>

</table>

</section>

`;

}