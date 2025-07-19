exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const value = Math.max(0, Math.min(100, parseFloat(queryParams.value) || 50)); // 0-100, default 50
    const color = queryParams.color || '#3B82F6'; // Default blue color
    const size = parseInt(queryParams.size) || 200; // Default size
    const strokeWidth = parseInt(queryParams.strokeWidth) || 20; // Default stroke width
    
    // Validate color format (basic hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    // Calculate dimensions
    const width = size;
    const height = size;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (Math.min(width, height) - strokeWidth) / 2;
    
    // Calculate progress angle (convert percentage to degrees)
    const progressAngle = (value / 100) * 360;
    
    // Calculate SVG arc parameters
    const startAngle = -90; // Start from top
    const endAngle = startAngle + progressAngle;
    
    // Convert angles to radians for calculations
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate arc coordinates
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    // Determine if arc is large (more than 180 degrees)
    const largeArcFlag = progressAngle > 180 ? 1 : 0;
    
    // Create the progress arc path
    const progressPath = progressAngle > 0 ? 
        `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}` : '';
    
    // Create the background circle path (full circle)
    const backgroundPath = `M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius - 0.01} ${centerY}`;
    
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            
            <!-- Background circle (gray) -->
            <circle 
                cx="${centerX}" 
                cy="${centerY}" 
                r="${radius}" 
                fill="none" 
                stroke="#E5E7EB" 
                stroke-width="${strokeWidth}"
            />
            
            <!-- Progress arc (colored) -->
            <path 
                d="${progressPath}" 
                fill="none" 
                stroke="url(#donutGradient)" 
                stroke-width="${strokeWidth}"
                stroke-linecap="round"
            />
            
            <!-- Percentage text -->
            <text 
                x="${centerX}" 
                y="${centerY}" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                font-family="Arial, sans-serif" 
                font-size="${Math.round(size * 0.15)}" 
                font-weight="bold" 
                fill="${color}"
            >
                ${Math.round(value)}%
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
            body: JSON.stringify({ error: 'Failed to generate progress donut SVG' }),
        };
    }
}; 