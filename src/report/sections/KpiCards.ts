import { ReportData } from "../Types";
import { icons } from "../Icons";
export function buildKpiCards(report: ReportData): string {

    const s = report.statistics;


    return `

<section class="card">

    <h2 class="section-title">

        Performance Metrics

    </h2>

    <div class="kpi-grid">

        <div class="kpi-card">

            <div class="kpi-icon">

${icons.total}

</div>

            <div class="kpi-title">

                Total Value

            </div>

            <div class="kpi-value">

                ${s.total.toFixed(2)}

            </div>

            <div class="kpi-subtitle">

                Sum of all observations

            </div>

        </div>

        <div class="kpi-card">

            <div class="kpi-icon">${icons.average}</div>

            <div class="kpi-title">

                Average

            </div>

            <div class="kpi-value">

                ${s.average.toFixed(2)}

            </div>

            <div class="kpi-subtitle">

                Mean value

            </div>

        </div>

        <div class="kpi-card">

            <div class="kpi-icon">${icons.maximum}</div>

            <div class="kpi-title">

                Highest Value

            </div>

            <div class="kpi-value">

                ${s.maximum}

            </div>

            <div class="kpi-subtitle">

                ${s.maximumLabel}

            </div>

        </div>

        <div class="kpi-card">

            <div class="kpi-icon">

                ${icons.growth}

            </div>

            <div class="kpi-title">

                Overall Trend

            </div>

            <div class="kpi-value">

                ${s.trend}

            </div>

            <div class="kpi-subtitle">

                Growth ${s.growth.toFixed(2)}%

            </div>

        </div>

    </div>

</section>

`;
}