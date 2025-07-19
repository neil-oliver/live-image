

exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const value = Math.max(0, Math.min(100, parseFloat(queryParams.value) || 50)); // 0-100, default 50
    const color = queryParams.color || '#3B82F6'; // Default blue color
    const aspectRatio = parseFloat(queryParams.aspectRatio) || 4; // Default 4:1 aspect ratio
    
    // Validate color format (basic hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    // Calculate dimensions based on aspect ratio
    const width = 500;
    const height = Math.round(width / aspectRatio);
    
    // Progress bar dimensions
    const barHeight = Math.round(height * 0.6); // 60% of container height
    const barY = (height - barHeight) / 2; // Center vertically
    const borderRadius = barHeight / 2; // Fully rounded ends
    
    // Calculate progress width
    const progressWidth = (value / 100) * (width - 40); // Leave 20px padding on each side
    
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
                </linearGradient>
            </defs>
            
            <!-- Background bar (gray) -->
            <rect 
                x="20" 
                y="${barY}" 
                width="${width - 40}" 
                height="${barHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="#E5E7EB" 
                stroke="none"
            />
            
            <!-- Progress bar (colored) -->
            <rect 
                x="20" 
                y="${barY}" 
                width="${progressWidth}" 
                height="${barHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="url(#progressGradient)" 
                stroke="none"
            />
            
            <!-- Optional: Add a subtle highlight at the top of the progress bar -->
            <rect 
                x="20" 
                y="${barY}" 
                width="${progressWidth}" 
                height="${Math.round(barHeight * 0.1)}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="white" 
                opacity="0.3"
            />
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
            body: JSON.stringify({ error: 'Failed to generate progress bar SVG' }),
        };
    }
}; 