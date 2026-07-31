export interface ReportTheme {

    primary: string;

    secondary: string;

    background: string;

    card: string;

    text: string;

}

export function getTheme(

    theme: string,

    primary?: string,

    secondary?: string

): ReportTheme {

    switch (theme) {

        case "emerald":
            return {
                primary: "#059669",
                secondary: "#10B981",
                background: "#ECFDF5",
                card: "#FFFFFF",
                text: "#064E3B"
            };

        case "purple":
            return {
                primary: "#7C3AED",
                secondary: "#A78BFA",
                background: "#F5F3FF",
                card: "#FFFFFF",
                text: "#312E81"
            };

        case "dark":
            return {
                primary: "#111827",
                secondary: "#374151",
                background: "#1F2937",
                card: "#374151",
                text: "#F9FAFB"
            };

        case "custom":
            return {
                primary: primary || "#2563EB",
                secondary: secondary || "#60A5FA",
                background: "#F8FAFC",
                card: "#FFFFFF",
                text: "#1E293B"
            };

        case "corporate":
        default:
            return {
                primary: "#2563EB",
                secondary: "#60A5FA",
                background: "#F8FAFC",
                card: "#FFFFFF",
                text: "#1E293B"
            };

    }
}