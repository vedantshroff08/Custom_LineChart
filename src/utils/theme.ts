export interface ChartTheme {
    lineColor: string;
    pointColor: string;
    gridColor: string;
    backgroundColor: string;
}

export const themes: Record<string, ChartTheme> = {
    indigo: {
        lineColor: "#4F46E5",
        pointColor: "#FFFFFF",
        gridColor: "#E5E7EB",
        backgroundColor: "#FFFFFF"
    },

    azure: {
        lineColor: "#2563EB",
        pointColor: "#FFFFFF",
        gridColor: "#E2E8F0",
        backgroundColor: "#FFFFFF"
    },

    emerald: {
        lineColor: "#10B981",
        pointColor: "#FFFFFF",
        gridColor: "#E5E7EB",
        backgroundColor: "#FFFFFF"
    },

    violet: {
        lineColor: "#7C3AED",
        pointColor: "#FFFFFF",
        gridColor: "#ECEBFF",
        backgroundColor: "#FFFFFF"
    },

    amber: {
        lineColor: "#F59E0B",
        pointColor: "#FFFFFF",
        gridColor: "#E5E7EB",
        backgroundColor: "#FFFFFF"
    },

    rose: {
        lineColor: "#F43F5E",
        pointColor: "#FFFFFF",
        gridColor: "#FCE7F3",
        backgroundColor: "#FFFFFF"
    },

    slate: {
        lineColor: "#475569",
        pointColor: "#FFFFFF",
        gridColor: "#CBD5E1",
        backgroundColor: "#FFFFFF"
    },

    dark: {
        lineColor: "#60A5FA",
        pointColor: "#111827",
        gridColor: "#374151",
        backgroundColor: "#111827"
    }
};