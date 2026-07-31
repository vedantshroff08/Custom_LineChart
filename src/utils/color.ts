/**
 * Lightens (positive percent) or darkens (negative percent) a hex color.
 * shadeColor("#4F46E5", -18) -> a darker indigo
 */
export function shadeColor(hex: string, percent: number): string {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);

    const amt = Math.round(2.55 * percent);

    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0x00ff) + amt;
    let b = (num & 0x0000ff) + amt;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return (
        "#" +
        (r < 16 ? "0" : "") + r.toString(16) +
        (g < 16 ? "0" : "") + g.toString(16) +
        (b < 16 ? "0" : "") + b.toString(16)
    );
}

export function hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
