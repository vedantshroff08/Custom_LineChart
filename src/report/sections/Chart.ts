import { ReportData } from "../Types";

export function buildChart(report: ReportData): string {

    if (!report.chartImage) {
        return "";
    }

    const trendClass =
        report.statistics.trend === "Increasing"
            ? "trend-positive"
            : report.statistics.trend === "Decreasing"
                ? "trend-negative"
                : "trend-neutral";

    return `

<section class="card chart-card">

    <div class="chart-header">

        <div>

            <div class="section-badge">

                Performance Overview

            </div>

            <h2 class="chart-heading">

                ${report.title}

            </h2>

            <p class="chart-subtitle">

                Interactive trend visualization generated from the selected dataset.

            </p>

            <div class="chart-meta">

                ${report.statistics.count} observations
                • Highest ${report.statistics.maximum}
                • Average ${report.statistics.average.toFixed(2)}

            </div>

        </div>

        <div class="trend-badge ${trendClass}">

            ${report.statistics.trend}

        </div>

    </div>

    <div class="chart-wrapper">

        <img
            src="${report.chartImage}"
            class="chart-image"
            loading="eager"
            alt="Performance Chart"
        />

    </div>

    <div class="chart-highlights">

        <div class="highlight highest">

            <div class="highlight-title">

                Highest Value

            </div>

            <div class="highlight-value">

                ${report.statistics.maximum}

            </div>

            <div class="highlight-subtitle">

                ${report.statistics.maximumLabel}

            </div>

        </div>

        <div class="highlight average">

            <div class="highlight-title">

                Average

            </div>

            <div class="highlight-value">

                ${report.statistics.average.toFixed(2)}

            </div>

            <div class="highlight-subtitle">

                Mean Value

            </div>

        </div>

        <div class="highlight growth">

            <div class="highlight-title">

                Growth

            </div>

            <div class="highlight-value">

                ${report.statistics.growth.toFixed(2)}%

            </div>

            <div class="highlight-subtitle">

                Overall Change

            </div>

        </div>

        <div class="highlight trend">

            <div class="highlight-title">

                Trend

            </div>

            <div class="highlight-value">

                ${report.statistics.trend}

            </div>

            <div class="highlight-subtitle">

                Performance Direction

            </div>

        </div>

    </div>

</section>

`;
}