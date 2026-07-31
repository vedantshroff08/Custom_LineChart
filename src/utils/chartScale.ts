export function calculateStep(values: number[]): number {
    if (values.length === 0) {
        return 1;
    }

    const max = Math.max(...values);

    if (max <= 5) {
        return 1;
    }

    const roughStep = max / 5;

    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));

    const residual = roughStep / magnitude;

    let niceStep: number;

    if (residual <= 1) {
        niceStep = 1;
    } else if (residual <= 2) {
        niceStep = 2;
    } else if (residual <= 5) {
        niceStep = 5;
    } else {
        niceStep = 10;
    }

    return niceStep * magnitude;
}