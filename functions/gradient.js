const { builder } = require('@netlify/functions');

const gradientHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const colors = queryParams.colors || '#3B82F6'; // Default blue color
    const direction = queryParams.direction || 'to right'; // Default direction
    const width = parseInt(queryParams.width) || 500; // Default width
    const height = parseInt(queryParams.height) || 300; // Default height
    const stops = queryParams.stops; // Optional stop positions
    
    // Debug logging
    console.log('Query params:', queryParams);
    console.log('Colors parameter:', colors);
    
    // Validate dimensions
    if (width < 1 || width > 2000 || height < 1 || height > 2000) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Width and height must be between 1 and 2000 pixels' }),
        };
    }
    
    // Parse colors (comma-separated)
    const colorArray = colors.split(',').map(c => c.trim());
    console.log('Color array:', colorArray);
    
    // Validate colors (hex validation with optional alpha)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})([A-Fa-f0-9]{2})?$/;
    for (const color of colorArray) {
        console.log('Validating color:', color, 'Valid:', colorRegex.test(color));
        if (!colorRegex.test(color)) {
            console.log('Color validation failed for:', color);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid color format. Use hex colors (e.g., #3B82F6 or #3B82F680 for transparency)' }),
            };
        }
    }
    
    // Parse stop positions if provided
    let stopArray = [];
    if (stops) {
        stopArray = stops.split(',').map(s => s.trim());
        if (stopArray.length !== colorArray.length) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Number of stops must match number of colors' }),
            };
        }
    } else {
        // Generate evenly distributed stops
        if (colorArray.length === 1) {
            // For single color, create two stops at 0% and 100% with the same color
            stopArray = ['0%', '100%'];
        } else {
            stopArray = colorArray.map((_, index) => {
                if (index === 0) return '0%';
                if (index === colorArray.length - 1) return '100%';
                return `${Math.round((index / (colorArray.length - 1)) * 100)}%`;
            });
        }
    }
    
    // Convert CSS direction to SVG gradient coordinates
    const getGradientCoordinates = (dir) => {
        switch (dir.toLowerCase()) {
            case 'to right':
                return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };
            case 'to left':
                return { x1: '100%', y1: '0%', x2: '0%', y2: '0%' };
            case 'to bottom':
                return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
            case 'to top':
                return { x1: '0%', y1: '100%', x2: '0%', y2: '0%' };
            case 'to bottom right':
                return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
            case 'to bottom left':
                return { x1: '100%', y1: '0%', x2: '0%', y2: '100%' };
            case 'to top right':
                return { x1: '0%', y1: '100%', x2: '100%', y2: '0%' };
            case 'to top left':
                return { x1: '100%', y1: '100%', x2: '0%', y2: '0%' };
            default:
                // Handle angle values (e.g., "45deg")
                const angleMatch = dir.match(/(\d+)deg/);
                if (angleMatch) {
                    const angle = parseInt(angleMatch[1]);
                    // Convert angle to SVG coordinates (simplified)
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 50 - 50 * Math.cos(rad);
                    const y1 = 50 - 50 * Math.sin(rad);
                    const x2 = 50 + 50 * Math.cos(rad);
                    const y2 = 50 + 50 * Math.sin(rad);
                    return { 
                        x1: `${Math.max(0, Math.min(100, x1))}%`, 
                        y1: `${Math.max(0, Math.min(100, y1))}%`, 
                        x2: `${Math.max(0, Math.min(100, x2))}%`, 
                        y2: `${Math.max(0, Math.min(100, y2))}%` 
                    };
                }
                // Default to horizontal
                return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };
        }
    };
    
    const coords = getGradientCoordinates(direction);
    
    // Generate SVG gradient stops with transparency support
    const gradientStops = stopArray.map((stopOffset, index) => {
        // For single color gradients, use the same color for all stops
        const colorIndex = colorArray.length === 1 ? 0 : index;
        const color = colorArray[colorIndex];
        
        // Parse color and alpha
        let hexColor = color;
        let opacity = 1;
        
        // Check if color has alpha channel (8 characters total)
        if (color.length === 9) {
            hexColor = color.substring(0, 7);
            const alphaHex = color.substring(7, 9);
            opacity = parseInt(alphaHex, 16) / 255;
        } else if (color.length === 4) {
            // Handle 3-digit hex with alpha
            hexColor = color.substring(0, 4);
            const alphaHex = color.substring(3, 4) + color.substring(3, 4);
            opacity = parseInt(alphaHex, 16) / 255;
        }
        
        return `<stop offset="${stopOffset}" style="stop-color:${hexColor};stop-opacity:${opacity}" />`;
    }).join('\n                ');
    
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="colorGradient" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
                    ${gradientStops}
                </linearGradient>
            </defs>
            
            <!-- Gradient rectangle -->
            <rect 
                x="0" 
                y="0" 
                width="${width}" 
                height="${height}" 
                fill="url(#colorGradient)" 
                stroke="none"
            />
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
            body: JSON.stringify({ error: 'Failed to generate gradient image' }),
        };
    }
};

exports.handler = builder(gradientHandler); 