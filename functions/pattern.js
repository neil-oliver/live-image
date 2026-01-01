const { lightenColor } = require('./shared-utils');

const patternHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const type = queryParams.type || 'stripes';
    const color1 = queryParams.color1 || '#3B82F6';
    const color2 = queryParams.color2 || ''; // Auto-generate if not provided
    const thickness = parseInt(queryParams.thickness) || 20;
    const count = parseInt(queryParams.count) || 10;
    const rotation = parseFloat(queryParams.rotation) || 0;
    const depth = queryParams.depth === 'true';
    const depthDirection = queryParams.depthDirection || 'to bottom';
    const depthOpacity = parseFloat(queryParams.depthOpacity) || 0.3;
    const width = parseInt(queryParams.width) || 800;
    const height = parseInt(queryParams.height) || 600;
    
    // Validate dimensions
    if (width < 1 || width > 3000 || height < 1 || height > 3000) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Width and height must be between 1 and 3000 pixels' }),
        };
    }
    
    // Validate pattern type
    const validTypes = ['stripes', 'sunburst', 'rings', 'checkerboard'];
    if (!validTypes.includes(type)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: `Invalid pattern type. Must be one of: ${validTypes.join(', ')}` }),
        };
    }
    
    // Validate colors
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color1)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color1 format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    // Auto-generate color2 if not provided
    let finalColor2 = color2;
    if (!color2) {
        finalColor2 = lightenColor(color1, 30);
    } else if (!colorRegex.test(color2)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color2 format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    try {
        // Generate pattern SVG
        let patternContent = '';
        
        switch (type) {
            case 'stripes':
                patternContent = createStripes(width, height, color1, finalColor2, thickness, rotation);
                break;
            case 'sunburst':
                patternContent = createSunburst(width, height, color1, finalColor2, count, rotation);
                break;
            case 'rings':
                patternContent = createRings(width, height, color1, finalColor2, thickness);
                break;
            case 'checkerboard':
                patternContent = createCheckerboard(width, height, color1, finalColor2, thickness);
                break;
        }
        
        // Add depth overlay if enabled
        let depthOverlay = '';
        let depthDefs = '';
        if (depth) {
            const { defs, overlay } = createDepthOverlay(width, height, depthDirection, depthOpacity);
            depthDefs = defs;
            depthOverlay = overlay;
        }
        
        const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        ${patternContent.defs || ''}
        ${depthDefs}
    </defs>
    ${patternContent.background || ''}
    ${patternContent.content || ''}
    ${depthOverlay}
</svg>`;
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=2592000',
                'Access-Control-Allow-Origin': '*'
            },
            body: svg
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate pattern', details: error.message }),
        };
    }
};

/**
 * Create stripes pattern
 */
function createStripes(width, height, color1, color2, thickness, rotation) {
    const stripeWidth = thickness;
    const patternWidth = stripeWidth * 2;
    
    // Calculate diagonal to ensure pattern covers rotated area
    const diagonal = Math.sqrt(width * width + height * height);
    const offset = (diagonal - Math.max(width, height)) / 2;
    
    const defs = `
        <pattern id="stripes" patternUnits="userSpaceOnUse" width="${patternWidth}" height="${patternWidth}">
            <rect width="${stripeWidth}" height="${patternWidth}" fill="${color1}"/>
            <rect x="${stripeWidth}" width="${stripeWidth}" height="${patternWidth}" fill="${color2}"/>
        </pattern>
    `;
    
    const content = `
        <g transform="rotate(${rotation}, ${width/2}, ${height/2})">
            <rect x="${-offset}" y="${-offset}" width="${diagonal}" height="${diagonal}" fill="url(#stripes)"/>
        </g>
    `;
    
    return { defs, content };
}

/**
 * Create sunburst pattern (radial rays from center)
 */
function createSunburst(width, height, color1, color2, count, rotation) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.sqrt(width * width + height * height) / 2;
    const angleStep = 360 / count;
    
    let rays = '';
    
    for (let i = 0; i < count; i++) {
        const startAngle = (i * angleStep + rotation) * (Math.PI / 180);
        const endAngle = ((i + 1) * angleStep + rotation) * (Math.PI / 180);
        
        // Calculate points for the ray (triangle from center to edge)
        const x1 = cx + Math.cos(startAngle) * radius;
        const y1 = cy + Math.sin(startAngle) * radius;
        const x2 = cx + Math.cos(endAngle) * radius;
        const y2 = cy + Math.sin(endAngle) * radius;
        
        const color = i % 2 === 0 ? color1 : color2;
        
        rays += `<polygon points="${cx},${cy} ${x1},${y1} ${x2},${y2}" fill="${color}"/>`;
    }
    
    const background = `<rect width="${width}" height="${height}" fill="${color1}"/>`;
    
    return { defs: '', background, content: rays };
}

/**
 * Create concentric rings pattern
 */
function createRings(width, height, color1, color2, thickness) {
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.sqrt(width * width + height * height) / 2;
    
    // Use thickness as the ring width, calculate how many rings needed to cover the area
    const ringWidth = thickness;
    const numRings = Math.ceil(maxRadius / ringWidth) + 1;
    
    let rings = '';
    
    // Draw rings from outside in so inner rings overlay outer
    for (let i = numRings; i >= 0; i--) {
        const radius = i * ringWidth;
        const color = i % 2 === 0 ? color1 : color2;
        
        rings += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}"/>`;
    }
    
    const background = `<rect width="${width}" height="${height}" fill="${color1}"/>`;
    
    return { defs: '', background, content: rings };
}

/**
 * Create checkerboard pattern
 */
function createCheckerboard(width, height, color1, color2, thickness) {
    const squareSize = thickness;
    
    const defs = `
        <pattern id="checkerboard" patternUnits="userSpaceOnUse" width="${squareSize * 2}" height="${squareSize * 2}">
            <rect width="${squareSize * 2}" height="${squareSize * 2}" fill="${color1}"/>
            <rect width="${squareSize}" height="${squareSize}" fill="${color2}"/>
            <rect x="${squareSize}" y="${squareSize}" width="${squareSize}" height="${squareSize}" fill="${color2}"/>
        </pattern>
    `;
    
    const content = `<rect width="${width}" height="${height}" fill="url(#checkerboard)"/>`;
    
    return { defs, content };
}

/**
 * Create depth overlay gradient
 */
function createDepthOverlay(width, height, direction, opacity) {
    // Convert direction to SVG gradient coordinates
    const coords = getGradientCoordinates(direction);
    
    const defs = `
        <linearGradient id="depthGradient" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
            <stop offset="0%" style="stop-color:#000000;stop-opacity:0"/>
            <stop offset="100%" style="stop-color:#000000;stop-opacity:${opacity}"/>
        </linearGradient>
    `;
    
    const overlay = `<rect width="${width}" height="${height}" fill="url(#depthGradient)"/>`;
    
    return { defs, overlay };
}

/**
 * Convert CSS direction to SVG gradient coordinates
 */
function getGradientCoordinates(dir) {
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
        case 'radial':
            // For radial, we'll use a different approach
            return { x1: '50%', y1: '50%', x2: '50%', y2: '100%' };
        default:
            return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
    }
}

exports.handler = patternHandler;
