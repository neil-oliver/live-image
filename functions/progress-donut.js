const { builder } = require('@netlify/functions');

const progressDonutHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const value = Math.max(0, Math.min(100, parseFloat(queryParams.value) || 50)); // 0-100, default 50
    const colorParam = queryParams.color || '#3B82F6'; // Default blue color
    const size = parseInt(queryParams.size) || 200; // Default size
    const strokeWidth = parseInt(queryParams.strokeWidth) || 20; // Default stroke width
    const padding = parseInt(queryParams.padding) || 10; // Default padding
    const backgroundColorParam = queryParams.bg || queryParams.bgColor || '#E5E7EB'; // Remaining ring color
    // Gradient span behavior: 'bar' (default) or 'progress'
    const gradientSpanParamRaw = (queryParams.gradientSpan || queryParams.gradientScope || 'bar');
    const gradientSpan = typeof gradientSpanParamRaw === 'string' ? gradientSpanParamRaw.toLowerCase() : 'bar';
    
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
    
    // Get the color for the current progress value (single-color fallback)
    const currentColor = getColorFromGradient(colors, value);
    
    // Calculate dimensions with padding
    const width = size + (padding * 2);
    const height = size + (padding * 2);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = (Math.min(size, size) - strokeWidth) / 2;
    
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
    // Special case for 100% - create a complete circle
    let progressPath;
    let useCircleForProgress = false;
    if (value >= 100) {
        // For 100%, we'll use a circle element instead of path for perfect alignment
        useCircleForProgress = true;
        progressPath = '';
    } else if (progressAngle > 0) {
        progressPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    } else {
        progressPath = '';
    }
    
    // Create the background circle path (full circle)
    const backgroundPath = `M ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius - 0.01} ${centerY}`;
    
    const hasGradient = colors.length > 1;
    const gradientStops = hasGradient
        ? colors.map((c, i) => {
            const offset = colors.length === 1 ? 100 : (i / (colors.length - 1)) * 100;
            return `<stop offset="${offset}%" stop-color="${c}" />`;
        }).join('')
        : '';

    // Determine gradient coordinates based on gradient span behavior.
    // If 'bar': span the entire circle diameter; if 'progress': span only the arc length proportionally.
    const gradientX1 = centerX - radius;
    const gradientX2Full = centerX + radius;
    const gradientX2Progress = centerX - radius + (2 * radius * (Math.max(0, Math.min(100, value)) / 100));
    const gradientX2 = gradientSpan === 'bar' ? gradientX2Full : gradientX2Progress;
    const gradientY = centerY;
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            ${hasGradient ? `
            <defs>
                <linearGradient id="donutGradient" gradientUnits="userSpaceOnUse"
                    x1="${gradientX1}" y1="${gradientY}"
                    x2="${gradientX2}" y2="${gradientY}">
                    ${gradientStops}
                </linearGradient>
            </defs>
            ` : ''}
            <!-- Background circle (remaining ring) -->
            <circle 
                cx="${centerX}" 
                cy="${centerY}" 
                r="${radius}" 
                fill="none" 
                stroke="${backgroundColorParam}" 
                stroke-width="${strokeWidth}"
            />
            
            <!-- Progress arc (colored) -->
            ${useCircleForProgress ? 
                `<circle 
                    cx="${centerX}" 
                    cy="${centerY}" 
                    r="${radius}" 
                    fill="none" 
                    stroke="${hasGradient ? 'url(#donutGradient)' : currentColor}" 
                    stroke-width="${strokeWidth}"
                />` : 
                `<path 
                    d="${progressPath}" 
                    fill="none" 
                    stroke="${hasGradient ? 'url(#donutGradient)' : currentColor}" 
                    stroke-width="${strokeWidth}"
                    stroke-linecap="round"
                />`
            }
            
            <!-- Percentage text -->
            <text 
                x="${centerX}" 
                y="${centerY}" 
                text-anchor="middle" 
                dominant-baseline="middle" 
                font-family="Arial, sans-serif" 
                font-size="${Math.round(size * 0.22)}" 
                fill="#000000"
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
                'Cache-Control': 'public, max-age=31536000', // 1 year since it's cached at edge
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

exports.handler = builder(progressDonutHandler); 