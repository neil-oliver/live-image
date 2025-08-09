

exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const value = Math.max(0, Math.min(100, parseFloat(queryParams.value) || 50)); // 0-100, default 50
    const colorParam = queryParams.color || '#3B82F6'; // Default blue color
    const backgroundColorParam = queryParams.bg || queryParams.bgColor || '#E5E7EB'; // Remaining track color
    // Gradient span behavior: 'bar' (default) or 'progress'
    const gradientSpanParamRaw = (queryParams.gradientSpan || queryParams.gradientScope || 'bar');
    const gradientSpan = typeof gradientSpanParamRaw === 'string' ? gradientSpanParamRaw.toLowerCase() : 'bar';
    const aspectRatio = parseFloat(queryParams.aspectRatio) || 4; // Default 4:1 aspect ratio
    
    // Parse colors - can be single color or comma-separated list
    let colors = [];
    if (colorParam.includes(',')) {
        // Multiple colors provided
        colors = colorParam.split(',').map(c => c.trim());
    } else {
        // Single color provided
        colors = [colorParam];
    }
    
    // Validate all colors
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    for (const color of colors) {
        if (!colorRegex.test(color)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6) or comma-separated list (e.g., #FF0000,#00FF00,#0000FF)' }),
            };
        }
    }
    if (!colorRegex.test(backgroundColorParam)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid bg color format. Use hex color (e.g., #E5E7EB).' }),
        };
    }
    
    // Function to interpolate between two colors
    function interpolateColor(color1, color2, factor) {
        // Convert hex to RGB
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        // Convert back to hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Function to get color from gradient based on progress
    function getColorFromGradient(colors, progress) {
        if (colors.length === 1) {
            return colors[0];
        }
        
        if (colors.length === 2) {
            return interpolateColor(colors[0], colors[1], progress / 100);
        }
        
        // For multiple colors, find the appropriate segment
        const segmentSize = 100 / (colors.length - 1);
        const segment = Math.floor(progress / segmentSize);
        const segmentProgress = (progress % segmentSize) / segmentSize;
        
        if (segment >= colors.length - 1) {
            return colors[colors.length - 1];
        }
        
        return interpolateColor(colors[segment], colors[segment + 1], segmentProgress);
    }
    
    // Get the color for the current progress value (used for single-color mode)
    const currentColor = getColorFromGradient(colors, value);
    
    // Calculate dimensions based on aspect ratio
    const width = 500;
    const height = Math.round(width / aspectRatio);
    
    // Progress bar dimensions
    const barHeight = Math.round(height * 0.6); // 60% of container height
    const barY = (height - barHeight) / 2; // Center vertically
    const borderRadius = barHeight / 2; // Fully rounded ends
    
    // Calculate progress width
    const progressWidth = (value / 100) * (width - 40); // Leave 20px padding on each side
    
    // Build gradient stops if multiple colors are provided
    const hasGradient = colors.length > 1;
    const gradientStops = hasGradient
        ? colors.map((c, i) => {
            const offset = colors.length === 1 ? 100 : (i / (colors.length - 1)) * 100;
            return `<stop offset="${offset}%" stop-color="${c}" />`;
        }).join('')
        : '';

    // Determine gradient coordinates based on gradient span behavior
    const gradientStartX = 20;
    const gradientEndX = gradientSpan === 'bar' ? (width - 20) : (20 + progressWidth);
    const gradientY = barY;

    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            ${hasGradient ? `
            <defs>
                <!-- Gradient can span the full bar or only the filled progress based on gradientSpan -->
                <linearGradient id="gradProgress" gradientUnits="userSpaceOnUse" x1="${gradientStartX}" y1="${gradientY}" x2="${gradientEndX}" y2="${gradientY}">
                    ${gradientStops}
                </linearGradient>
            </defs>
            ` : ''}
            <!-- Background bar (remaining track) -->
            <rect 
                x="20" 
                y="${barY}" 
                width="${width - 40}" 
                height="${barHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="${backgroundColorParam}" 
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
                fill="${hasGradient ? 'url(#gradProgress)' : currentColor}" 
                stroke="none"
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