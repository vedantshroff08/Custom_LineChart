import { ReportTheme } from "./ThemeManager";

export function reportStyles(theme: ReportTheme): string {
    return `

/* ==========================================================
   RESET
========================================================== */

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:"Segoe UI",Arial,Helvetica,sans-serif;
    background:${theme.background};
    color:${theme.text};
    font-size:14px;
    line-height:1.6;
    padding:32px;
}

.report{
    width:100%;
    max-width:1180px;
    margin:auto;
}

h1,h2,h3,h4{
    margin:0;
    font-weight:700;
}

p{
    margin:0;
}

.section-title{
    font-size:24px;
    color:${theme.primary};
    margin-bottom:18px;
}

.card{
    position:relative;
    background:${theme.card};
    border-radius:18px;
    padding:24px;
    margin-bottom:24px;
    border:1px solid rgba(148,163,184,.25);
    overflow:hidden;
    box-shadow:0 10px 30px rgba(15,23,42,.08);
}

.card::before{
    content:"";
    position:absolute;
    left:0;
    top:0;
    width:100%;
    height:5px;
    background:linear-gradient(90deg,${theme.primary},${theme.secondary});
}

/* HEADER */

.report-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:30px;
}

.header-left{
    display:flex;
    align-items:center;
    gap:24px;
}

.company-logo{
    width:90px;
    height:90px;
    object-fit:contain;
    border-radius:12px;
}

.report-title{
    font-size:36px;
    font-weight:700;
    color:${theme.primary};
}

.report-company,
.report-date{
    color:${theme.text};
    opacity:.7;
}

/* EXECUTIVE SUMMARY */

.summary{
    background:linear-gradient(135deg,${theme.primary},${theme.secondary});
    color:#fff;
    border-radius:20px;
    padding:30px;
    overflow:hidden;
}

/* CHART */

.chart-card{
    padding:28px;
}

.chart-header{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:24px;
}

.section-badge{
    display:inline-block;
    padding:6px 14px;
    border-radius:30px;
    background:${theme.primary}15;
    color:${theme.primary};
    font-size:12px;
    font-weight:600;
    margin-bottom:12px;
}

.chart-heading{
    font-size:28px;
    color:${theme.text};
}

.chart-subtitle{
    margin-top:8px;
    color:${theme.text};
    opacity:.7;
}

.chart-meta{
    margin-top:10px;
    color:${theme.text};
    opacity:.6;
    font-size:13px;
}

.chart-wrapper{
    margin-top:22px;
    padding:20px;
    border-radius:18px;
    background:${theme.card};
    border:1px solid rgba(148,163,184,.18);
    text-align:center;
}

.chart-image{
    display:block;
    width:100%;
    max-width:760px;
    max-height:320px;
    object-fit:contain;
    margin:auto;
}

.trend-badge{
    padding:10px 18px;
    border-radius:30px;
    font-size:13px;
    font-weight:600;
}

.trend-positive{background:#DCFCE7;color:#166534;}
.trend-negative{background:#FEE2E2;color:#991B1B;}
.trend-neutral{background:#E5E7EB;color:#374151;}

.chart-highlights{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:18px;
    margin-top:24px;
}

.highlight{
    background:${theme.card};
    border:1px solid rgba(148,163,184,.18);
    border-radius:16px;
    padding:20px;
}

.highlight.highest{border-top:4px solid #2563EB;}
.highlight.average{border-top:4px solid #10B981;}
.highlight.growth{border-top:4px solid #F59E0B;}
.highlight.trend{border-top:4px solid #7C3AED;}

.highlight-title{font-size:13px;color:${theme.text};opacity:.65;}
.highlight-value{margin-top:10px;font-size:28px;font-weight:700;color:${theme.primary};}
.highlight-subtitle{margin-top:8px;font-size:12px;color:${theme.text};opacity:.55;}

/* KPI */

.kpi-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:20px;
    margin-top:20px;
}

.kpi-card{
    background:${theme.card};
    border:1px solid rgba(148,163,184,.18);
    border-radius:18px;
    padding:24px;
    position:relative;
}

.kpi-card::before{
    content:"";
    position:absolute;
    left:0;
    top:0;
    width:6px;
    height:100%;
    background:${theme.primary};
}

.kpi-icon{
    width:54px;
    height:54px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:14px;
    background:${theme.primary}12;
    color:${theme.primary};
    margin-bottom:18px;
}

.kpi-title{font-size:13px;color:${theme.text};opacity:.7;}
.kpi-value{margin-top:10px;font-size:32px;font-weight:700;color:${theme.primary};}
.kpi-subtitle{margin-top:10px;font-size:13px;color:${theme.text};opacity:.55;}

/* TABLE */

table{
    width:100%;
    border-collapse:collapse;
    margin-top:18px;
}

thead th{
    background:${theme.primary};
    color:#fff;
    padding:14px;
    text-align:left;
}

tbody td{
    padding:14px;
    border-bottom:1px solid rgba(148,163,184,.18);
}

tbody tr:nth-child(even){
    background:${theme.background};
}

tbody tr:hover{
    background:${theme.primary}10;
}

/* FOOTER */

.report-footer{
    margin-top:30px;
    border-top:2px solid ${theme.primary};
    padding-top:18px;
    display:flex;
    justify-content:space-between;
    color:${theme.text};
    opacity:.75;
}

/* RESPONSIVE */

@media(max-width:900px){
    .kpi-grid,
    .chart-highlights{
        grid-template-columns:repeat(2,1fr);
    }
}

/* PRINT */

@page{
    size:A4 portrait;
    margin:10mm;
}

.card,.summary,.kpi-card{
    break-inside:avoid;
    page-break-inside:avoid;
}

/* ==========================================================
   TOOLBAR
========================================================== */

.toolbar{

    position:sticky;

    top:0;

    z-index:999;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:16px 24px;

    margin-bottom:24px;

    background:white;

    border-bottom:1px solid #E5E7EB;

    box-shadow:0 2px 12px rgba(15,23,42,.08);

}

.toolbar-title{

    font-size:18px;

    font-weight:700;

    color:${theme.primary};

}

.toolbar-right{

    display:flex;

    gap:12px;

}

.toolbar-button{

    border:none;

    border-radius:10px;

    padding:10px 18px;

    cursor:pointer;

    font-size:14px;

    font-weight:600;

    transition:.2s;

}

.toolbar-button:hover{

    transform:translateY(-2px);

}

.toolbar-button.print{

    background:${theme.primary};

    color:white;

}

.toolbar-button.download{

    background:#10B981;

    color:white;

}

@media print{

    .toolbar{

        display:none;

    }

}

`;
}
