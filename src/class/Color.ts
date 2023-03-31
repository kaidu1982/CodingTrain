export const blendColors = (
    color1: string,
    color2: string,
    ratio: number
): string => {
    // Convert colors to RGB arrays
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    // Calculate the blended color
    const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio);
    const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio);
    const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio);

    // Convert RGB values back to hex string
    return rgbToHex(r, g, b);
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
