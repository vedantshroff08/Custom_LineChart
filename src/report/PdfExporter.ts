import { PDFDocument, PDFPage, PDFFont, rgb, RGB, StandardFonts } from "pdf-lib";
import { ReportData } from "./Types";
import { getTheme, ReportTheme } from "./ThemeManager";

const PAGE_WIDTH = 595.28; // A4 portrait, points
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface PdfContext {
    doc: PDFDocument;
    pages: PDFPage[];
    page: PDFPage;
    y: number;
    theme: ReportTheme;
    fontRegular: PDFFont;
    fontBold: PDFFont;
}

function hexToRgb(hex: string, fallback = "#2563EB"): RGB {
    const clean = (hex || fallback).replace("#", "");
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    const bigint = parseInt(full, 16) || 0;
    return rgb(((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255);
}

// StandardFonts only support WinAnsi (roughly Latin-1). Strip anything else
// (e.g. emoji from labels) rather than letting pdf-lib throw an encoding error.
function safe(text: unknown): string {
    return String(text ?? "").replace(/[^\x00-\xFF]/g, "").trim() || "-";
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = candidate;
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines;
}

function newPage(ctx: PdfContext): void {
    const page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({
        x: 0,
        y: 0,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        color: hexToRgb(ctx.theme.background)
    });
    ctx.pages.push(page);
    ctx.page = page;
    ctx.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(ctx: PdfContext, height: number): void {
    if (ctx.y - height < MARGIN + 24) {
        newPage(ctx);
    }
}

function text(
    ctx: PdfContext,
    str: string,
    x: number,
    y: number,
    opts: { font?: PDFFont; size?: number; color?: RGB } = {}
): void {
    ctx.page.drawText(safe(str), {
        x,
        y,
        font: opts.font || ctx.fontRegular,
        size: opts.size || 10,
        color: opts.color || hexToRgb(ctx.theme.text)
    });
}

function cardBackground(ctx: PdfContext, height: number): void {
    ctx.page.drawRectangle({
        x: MARGIN,
        y: ctx.y - height,
        width: CONTENT_WIDTH,
        height,
        color: hexToRgb(ctx.theme.card),
        borderColor: rgb(0.85, 0.87, 0.91),
        borderWidth: 1
    });
}

/** Small filled-pill "badge", e.g. the trend indicator or section badge. */
function badge(
    ctx: PdfContext,
    label: string,
    x: number,
    y: number,
    color: RGB,
    textColor: RGB = rgb(1, 1, 1)
): number {
    const size = 8;
    const paddingX = 8;
    const width = ctx.fontBold.widthOfTextAtSize(label, size) + paddingX * 2;
    ctx.page.drawRectangle({ x, y, width, height: 16, color });
    text(ctx, label, x + paddingX, y + 4, { font: ctx.fontBold, size, color: textColor });
    return width;
}

// --- Section builders, mirroring the HTML report's section files -------------

async function buildHeaderSection(ctx: PdfContext, report: ReportData): Promise<void> {
    const height = 70;
    ensureSpace(ctx, height + 20);
    cardBackground(ctx, height);

    let textX = MARGIN + 20;

    const logoImage = await tryEmbedLogo(ctx, report.logo);
    if (logoImage) {
        const logoBox = 40; // matches the HTML report's .company-logo sizing
        const scale = Math.min(logoBox / logoImage.width, logoBox / logoImage.height);
        const drawWidth = logoImage.width * scale;
        const drawHeight = logoImage.height * scale;
        // Vertically center the logo within the header card.
        const logoY = ctx.y - (height - drawHeight) / 2 - drawHeight;
        ctx.page.drawImage(logoImage, {
            x: MARGIN + 20,
            y: logoY,
            width: drawWidth,
            height: drawHeight
        });
        textX = MARGIN + 20 + logoBox + 14;
    }

    text(ctx, report.title || "Line Chart Report", textX, ctx.y - 34, {
        font: ctx.fontBold,
        size: 18,
        color: hexToRgb(ctx.theme.text)
    });
    if (report.companyName) {
        text(ctx, report.companyName, textX, ctx.y - 52, {
            size: 10,
            color: rgb(0.45, 0.5, 0.58)
        });
    }
    ctx.y -= height + 20;
}

/**
 * Fetches and embeds the company logo. `report.logo` is typically a relative
 * path served by the same Mendix app (e.g. "/img/logo.png"), so we resolve it
 * against the current origin and fetch it; falls back to treating it as an
 * absolute URL or a data: URI. Returns null (rather than throwing) if the
 * logo is missing, unreachable, or in a format pdf-lib can't embed (e.g. SVG).
 */
async function tryEmbedLogo(ctx: PdfContext, logo?: string) {
    if (!logo || !logo.trim()) {
        return null;
    }

    try {
        let bytes: Uint8Array;

        if (logo.startsWith("data:")) {
            const base64 = logo.split(",")[1] ?? "";
            bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        } else {
            const url = /^https?:\/\//i.test(logo)
                ? logo
                : new URL(logo, window.location.origin).toString();
            const response = await fetch(url);
            if (!response.ok) {
                return null;
            }
            const buffer = await response.arrayBuffer();
            bytes = new Uint8Array(buffer);
        }

        // Detect format from magic bytes rather than trusting the file extension.
        const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
        const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

        if (isPng) {
            return await ctx.doc.embedPng(bytes);
        }
        if (isJpg) {
            return await ctx.doc.embedJpg(bytes);
        }
        // SVG or other formats aren't supported by pdf-lib's embed APIs.
        return null;
    } catch {
        return null;
    }
}

function buildExecutiveSummarySection(ctx: PdfContext, report: ReportData): void {
    const s = report.statistics;
    const paragraph =
        `This report contains ${s.count} observations. The highest value recorded is ` +
        `${s.maximum} during ${s.maximumLabel}. The average value is ${s.average.toFixed(2)}. ` +
        `Overall growth is ${s.growth.toFixed(2)}%. The overall trend is ${s.trend}.`;

    const lines = wrapText(safe(paragraph), ctx.fontRegular, 10, CONTENT_WIDTH - 40);
    const height = 40 + lines.length * 14;
    ensureSpace(ctx, height + 20);
    cardBackground(ctx, height);

    text(ctx, "Executive Summary", MARGIN + 20, ctx.y - 26, {
        font: ctx.fontBold,
        size: 13,
        color: hexToRgb(ctx.theme.primary)
    });
    lines.forEach((line, i) => {
        text(ctx, line, MARGIN + 20, ctx.y - 44 - i * 14, { size: 10 });
    });
    ctx.y -= height + 20;
}

function buildInfoCardsSection(ctx: PdfContext, report: ReportData): void {
    const height = 64;
    ensureSpace(ctx, height + 20);
    cardBackground(ctx, height);

    const items: Array<[string, string]> = [
        ["Generated On", report.generatedOn.toLocaleString()],
        ["Generated By", report.generatedBy || "-"],
        ["Company", report.companyName || "-"]
    ];
    const colWidth = (CONTENT_WIDTH - 40) / 3;
    items.forEach(([label, value], i) => {
        const x = MARGIN + 20 + i * colWidth;
        text(ctx, label.toUpperCase(), x, ctx.y - 24, { size: 8, color: rgb(0.45, 0.5, 0.58) });
        text(ctx, value, x, ctx.y - 40, { font: ctx.fontBold, size: 11 });
    });
    ctx.y -= height + 20;
}

async function buildChartSection(ctx: PdfContext, report: ReportData): Promise<void> {
    const trendColor =
        report.statistics.trend === "Increasing"
            ? rgb(0.02, 0.6, 0.4)
            : report.statistics.trend === "Decreasing"
                ? rgb(0.86, 0.15, 0.15)
                : rgb(0.5, 0.55, 0.6);

    // Header row of the chart card (badge, heading, subtitle, meta, trend badge)
    const headerHeight = 86;
    ensureSpace(ctx, headerHeight + 260);

    const cardTop = ctx.y;
    let innerY = ctx.y - 20;

    badge(ctx, "PERFORMANCE OVERVIEW", MARGIN + 20, innerY - 8, hexToRgb(ctx.theme.primary));
    innerY -= 26;
    text(ctx, report.title || "Line Chart Report", MARGIN + 20, innerY, {
        font: ctx.fontBold,
        size: 15
    });
    innerY -= 16;
    text(
        ctx,
        "Interactive trend visualization generated from the selected dataset.",
        MARGIN + 20,
        innerY,
        { size: 9, color: rgb(0.45, 0.5, 0.58) }
    );
    innerY -= 14;
    text(
        ctx,
        `${report.statistics.count} observations  |  Highest ${report.statistics.maximum}  |  Average ${report.statistics.average.toFixed(2)}`,
        MARGIN + 20,
        innerY,
        { size: 9, color: rgb(0.45, 0.5, 0.58) }
    );

    // Trend badge, right-aligned to the card
    const trendLabel = safe(report.statistics.trend).toUpperCase();
    const trendWidth = ctx.fontBold.widthOfTextAtSize(trendLabel, 8) + 16;
    badge(ctx, trendLabel, MARGIN + CONTENT_WIDTH - 20 - trendWidth, cardTop - 30, trendColor);

    ctx.y = innerY - 16;

    // Chart image
    if (report.chartImage) {
        try {
            const base64 = report.chartImage.split(",")[1] ?? report.chartImage;
            const imageBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const png = await ctx.doc.embedPng(imageBytes);
            const availableWidth = CONTENT_WIDTH - 40;
            const scale = availableWidth / png.width;
            const drawWidth = availableWidth;
            const drawHeight = png.height * scale;
            ctx.y -= drawHeight;
            ctx.page.drawImage(png, { x: MARGIN + 20, y: ctx.y, width: drawWidth, height: drawHeight });
            ctx.y -= 20;
        } catch {
            text(ctx, "(chart image unavailable)", MARGIN + 20, ctx.y, { size: 9, color: rgb(0.6, 0.6, 0.6) });
            ctx.y -= 20;
        }
    }

    // Highlight cards (Highest / Average / Growth / Trend)
    const highlights: Array<[string, string, string]> = [
        ["Highest Value", String(report.statistics.maximum), report.statistics.maximumLabel],
        ["Average", report.statistics.average.toFixed(2), "Mean Value"],
        ["Growth", `${report.statistics.growth.toFixed(2)}%`, "Overall Change"],
        ["Trend", report.statistics.trend, "Performance Direction"]
    ];
    const hHeight = 56;
    ensureSpace(ctx, hHeight + 20);
    const colWidth = (CONTENT_WIDTH - 40 - 3 * 10) / 4;
    highlights.forEach(([title, value, subtitle], i) => {
        const x = MARGIN + 20 + i * (colWidth + 10);
        ctx.page.drawRectangle({
            x,
            y: ctx.y - hHeight,
            width: colWidth,
            height: hHeight,
            color: hexToRgb(ctx.theme.background),
            borderColor: rgb(0.85, 0.87, 0.91),
            borderWidth: 1
        });
        text(ctx, title.toUpperCase(), x + 10, ctx.y - 18, { size: 7, color: rgb(0.45, 0.5, 0.58) });
        text(ctx, value, x + 10, ctx.y - 34, { font: ctx.fontBold, size: 12 });
        text(ctx, subtitle, x + 10, ctx.y - 48, { size: 7, color: rgb(0.45, 0.5, 0.58) });
    });
    ctx.y -= hHeight + 24;
}

function buildKpiCardsSection(ctx: PdfContext, report: ReportData): void {
    const s = report.statistics;
    const kpis: Array<[string, string, string]> = [
        ["Total Value", s.total.toFixed(2), "Sum of all observations"],
        ["Average", s.average.toFixed(2), "Mean value"],
        ["Highest Value", String(s.maximum), s.maximumLabel],
        ["Overall Trend", s.trend, `Growth ${s.growth.toFixed(2)}%`]
    ];

    ensureSpace(ctx, 90);
    text(ctx, "Performance Metrics", MARGIN, ctx.y - 4, {
        font: ctx.fontBold,
        size: 14,
        color: hexToRgb(ctx.theme.primary)
    });
    ctx.y -= 24;

    const cardHeight = 64;
    ensureSpace(ctx, cardHeight + 20);
    const colWidth = (CONTENT_WIDTH - 3 * 10) / 4;
    kpis.forEach(([title, value, subtitle], i) => {
        const x = MARGIN + i * (colWidth + 10);
        ctx.page.drawRectangle({
            x,
            y: ctx.y - cardHeight,
            width: colWidth,
            height: cardHeight,
            color: hexToRgb(ctx.theme.card),
            borderColor: rgb(0.85, 0.87, 0.91),
            borderWidth: 1
        });
        text(ctx, title.toUpperCase(), x + 10, ctx.y - 18, { size: 7, color: rgb(0.45, 0.5, 0.58) });
        text(ctx, value, x + 10, ctx.y - 36, { font: ctx.fontBold, size: 13 });
        text(ctx, subtitle, x + 10, ctx.y - 52, { size: 7, color: rgb(0.45, 0.5, 0.58) });
    });
    ctx.y -= cardHeight + 24;
}

function drawTableHeader(ctx: PdfContext, colX: number[]): void {
    const rowHeight = 22;
    ctx.page.drawRectangle({
        x: MARGIN,
        y: ctx.y - rowHeight,
        width: CONTENT_WIDTH,
        height: rowHeight,
        color: hexToRgb(ctx.theme.primary)
    });
    const headers = ["#", "Label", "Value", "Change", "Trend"];
    headers.forEach((h, i) => {
        text(ctx, h, colX[i], ctx.y - 15, { font: ctx.fontBold, size: 9, color: rgb(1, 1, 1) });
    });
    ctx.y -= rowHeight;
}

function buildDataTableSection(ctx: PdfContext, report: ReportData): void {
    ensureSpace(ctx, 60);
    text(ctx, "Data Analysis", MARGIN, ctx.y - 4, {
        font: ctx.fontBold,
        size: 14,
        color: hexToRgb(ctx.theme.primary)
    });
    ctx.y -= 22;

    const colX = [
        MARGIN + 10,
        MARGIN + 45,
        MARGIN + CONTENT_WIDTH * 0.45,
        MARGIN + CONTENT_WIDTH * 0.65,
        MARGIN + CONTENT_WIDTH * 0.85
    ];

    ensureSpace(ctx, 30);
    drawTableHeader(ctx, colX);

    const rowHeight = 18;
    const { labels, values } = report.chartData;

    labels.forEach((label, index) => {
        if (ctx.y - rowHeight < MARGIN + 24) {
            newPage(ctx);
            drawTableHeader(ctx, colX);
        }

        const value = values[index];
        const previous = index === 0 ? null : values[index - 1];
        let change = "-";
        let trendColor = rgb(0.6, 0.6, 0.6);
        let trendSymbol = "=";

        if (previous !== null && previous !== 0) {
            const growth = ((value - previous) / previous) * 100;
            change = `${growth.toFixed(2)}%`;
            if (growth > 0) {
                trendColor = rgb(0.02, 0.6, 0.4);
                trendSymbol = "+";
            } else if (growth < 0) {
                trendColor = rgb(0.86, 0.15, 0.15);
                trendSymbol = "-";
            }
        }

        if (index % 2 === 1) {
            ctx.page.drawRectangle({
                x: MARGIN,
                y: ctx.y - rowHeight,
                width: CONTENT_WIDTH,
                height: rowHeight,
                color: hexToRgb(ctx.theme.background)
            });
        }

        text(ctx, String(index + 1), colX[0], ctx.y - 13, { size: 9 });
        text(ctx, String(label), colX[1], ctx.y - 13, { size: 9 });
        text(ctx, String(value), colX[2], ctx.y - 13, { size: 9 });
        text(ctx, change, colX[3], ctx.y - 13, { size: 9 });
        ctx.page.drawCircle({ x: colX[4] + 4, y: ctx.y - 10, size: 4, color: trendColor });
        text(ctx, trendSymbol, colX[4] + 12, ctx.y - 13, { size: 9, color: trendColor, font: ctx.fontBold });

        ctx.y -= rowHeight;
    });

    ctx.y -= 16;
}

function stampFootersAndPageNumbers(ctx: PdfContext, footerText: string): void {
    const total = ctx.pages.length;
    ctx.pages.forEach((page, i) => {
        page.drawText(safe(footerText || "Generated using ModernLineChart"), {
            x: MARGIN,
            y: 20,
            font: ctx.fontRegular,
            size: 8,
            color: rgb(0.5, 0.55, 0.6)
        });
        const pageLabel = `Page ${i + 1} of ${total}`;
        const width = ctx.fontRegular.widthOfTextAtSize(pageLabel, 8);
        page.drawText(pageLabel, {
            x: PAGE_WIDTH - MARGIN - width,
            y: 20,
            font: ctx.fontRegular,
            size: 8,
            color: rgb(0.5, 0.55, 0.6)
        });
    });
}

/**
 * Builds a downloadable PDF that mirrors the HTML report's structure and
 * theming: header, executive summary, info cards, chart with highlights,
 * KPI cards, a full (paginated) data table, and a footer on every page.
 */
export async function generatePdfReport(report: ReportData): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const theme = getTheme(report.reportTheme, report.primaryColor, report.secondaryColor);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const ctx: PdfContext = {
        doc,
        pages: [],
        page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), // replaced by newPage() below
        y: PAGE_HEIGHT - MARGIN,
        theme,
        fontRegular,
        fontBold
    };
    // Remove the placeholder page created above and start clean via newPage()
    doc.removePage(0);
    newPage(ctx);

    await buildHeaderSection(ctx, report);
    buildExecutiveSummarySection(ctx, report);
    buildInfoCardsSection(ctx, report);
    await buildChartSection(ctx, report);
    buildKpiCardsSection(ctx, report);
    buildDataTableSection(ctx, report);

    stampFootersAndPageNumbers(ctx, report.footerText);

    return doc.save();
}

/**
 * Triggers a browser download of the generated PDF bytes.
 */
export function downloadPdf(bytes: Uint8Array, fileName: string): void {
    const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
