exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const text = queryParams.text || 'Pill'; // Default text
    const color = queryParams.color || '#3B82F6'; // Default blue color
    const textColor = queryParams.textColor || '#FFFFFF'; // Default white text
    
    // Validate color format (basic hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color) || !colorRegex.test(textColor)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    // Calculate dimensions based on text length
    const fontSize = 16;
    const padding = 20; // Horizontal padding
    const verticalPadding = 12; // Vertical padding
    const textWidth = text.length * fontSize * 0.6; // Approximate text width
    const pillWidth = Math.max(100, textWidth + (padding * 2)); // Minimum 100px width
    const pillHeight = fontSize + (verticalPadding * 2);
    const borderRadius = pillHeight / 2; // Fully rounded ends
    
    // SVG dimensions with some margin
    const svgWidth = pillWidth + 40;
    const svgHeight = pillHeight + 40;
    
    const svgImage = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            
            <!-- Pill background -->
            <rect 
                x="20" 
                y="20" 
                width="${pillWidth}" 
                height="${pillHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="url(#pillGradient)" 
                stroke="none"
            />
            
            <!-- Subtle highlight at the top -->
            <rect 
                x="20" 
                y="20" 
                width="${pillWidth}" 
                height="${Math.round(pillHeight * 0.3)}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="white" 
                opacity="0.2"
            />
            
            <!-- Text -->
            <text 
                x="${20 + pillWidth / 2}" 
                y="${20 + pillHeight / 2 + fontSize / 3}" 
                text-anchor="middle" 
                font-size="${fontSize}" 
                font-family="Arial, sans-serif"
                font-weight="500"
                fill="${textColor}"
            >
                ${text}
            </text>
        </svg>
    `;

    try {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
            },
            body: svgImage,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate pill SVG' }),
        };
    }
}; 