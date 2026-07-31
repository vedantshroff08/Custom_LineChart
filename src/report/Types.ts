export interface ChartData {
    labels: string[];
    values: number[];
}

export interface ReportStatistics {
    total: number;
    average: number;

    minimum: number;
    maximum: number;

    minimumLabel: string;
    maximumLabel: string;

    count: number;

    growth: number;

    median: number;

    variance: number;

    standardDeviation: number;

    trend: string;
}

export interface ReportOptions {
    title: string;

    companyName: string;

    generatedBy: string;

    footerText: string;

    includeChart: boolean;

    includeStatistics: boolean;

    includeTable: boolean;

    companyLogo: string;

    reportTheme: string;

    primaryColor: string;

    secondaryColor: string;
}

export interface ReportData {
    title: string;

    companyName: string;

    generatedBy: string;

    generatedOn: Date;

    footerText: string;

    chartImage: string;

    chartData: ChartData;

    statistics: ReportStatistics;

    // Branding
    logo?: string;

    reportTheme: string;

    primaryColor: string;

    secondaryColor: string;
}