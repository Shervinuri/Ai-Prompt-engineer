// Regex to find text within quotes after keywords like 'تابلو', 'نوشته', 'تیتر'
const visualRegex = /(?:تابلو|نوشته|تیتر)\s*(?:با نوشته)?\s*[:«"'](.+?)[:»"']/i;

/**
 * Identifies text intended for visual display from a prompt.
 * @param prompt The user's full Persian prompt.
 * @returns An object containing the matched visual text, or null if not found.
 */
export const identifyTextParts = (prompt: string): { visualText: string | null } => {
    const match = prompt.match(visualRegex);
    return { visualText: match ? match[1].trim() : null };
};

/**
 * Generates an SVG string from a given text using a loaded opentype.js font.
 * @param text The text to convert.
 * @param font The loaded opentype.js font instance.
 * @returns A string containing the full SVG code.
 */
export const generateSvgFromText = (text: string, font: opentype.Font): string => {
    const fontSize = 72;
    const path = font.getPath(text, 0, fontSize, fontSize);
    const boundingBox = path.getBoundingBox();
    const svgPathData = path.toPathData(5);

    const width = Math.ceil(boundingBox.x2 - boundingBox.x1);
    const height = Math.ceil(boundingBox.y2 - boundingBox.y1);
    const viewBox = `${Math.floor(boundingBox.x1)} ${Math.floor(boundingBox.y1)} ${width} ${height}`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}"><path d="${svgPathData}" fill="black"/></svg>`;
};