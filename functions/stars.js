exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const totalStars = Math.max(1, Math.min(10, parseInt(queryParams.total) || 5)); // 1-10 stars, default 5
    const value = Math.max(0, Math.min(totalStars, parseFloat(queryParams.value) || 0)); // 0 to totalStars, default 0
    const colorParam = queryParams.color || '#FFD700'; // Default gold color
    const size = parseInt(queryParams.size) || 200; // Default size
    const padding = parseInt(queryParams.padding) || 10; // Default padding
    
    // Validate size
    if (size < 32 || size > 512) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Size must be between 32 and 512 pixels' }),
        };
    }
    
    // Validate padding
    if (padding < 0 || padding > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Padding must be between 0 and 100 pixels' }),
        };
    }
    
    // Validate color (hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(colorParam)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #FFD700)' }),
        };
    }
    
    try {
        // Generate SVG
        const svg = createStarsSVG({ totalStars, value, color: colorParam, size, padding });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
                'Access-Control-Allow-Origin': '*'
            },
            body: svg
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate stars SVG', details: error.message }),
        };
    }
};

/**
 * Create a star rating SVG
 * 
 * @param {Object} opts
 * @param {number} opts.totalStars - Total number of stars to display
 * @param {number} opts.value - Number of filled stars
 * @param {string} opts.color - Color for filled stars
 * @param {number} opts.size - Size of the SVG
 * @param {number} opts.padding - Padding around the stars
 * @returns {string} SVG string
 */
function createStarsSVG(opts = {}) {
    const {
        totalStars = 5,
        value = 0,
        color = '#FFD700',
        size = 200,
        padding = 10
    } = opts;

    // Calculate star dimensions
    const starSize = size / totalStars * 0.8; // Each star takes up 80% of its allocated space
    const starSpacing = size / totalStars;
    
    // Calculate content dimensions (stars area)
    const contentWidth = totalStars * starSpacing;
    const contentHeight = starSize;
    
    // Calculate total dimensions with padding
    const totalWidth = contentWidth + (padding * 2);
    const totalHeight = contentHeight + (padding * 2);
    
    // Create star path (5-pointed star)
    const starPath = createStarPath(starSize / 2);
    
    let starsHTML = '';
    
    for (let i = 0; i < totalStars; i++) {
        const x = padding + (i * starSpacing) + (starSpacing / 2);
        const y = padding + (contentHeight / 2);
        
        if (i < Math.floor(value)) {
            // Fully filled star
            starsHTML += `<path d="${starPath}" transform="translate(${x}, ${y})" fill="${color}" stroke="${color}" stroke-width="1"/>`;
        } else if (i === Math.floor(value) && value % 1 > 0) {
            // Partially filled star
            const fillPercentage = value % 1;
            const clipId = `clip-${i}`;
            
            starsHTML += `
                <defs>
                    <clipPath id="${clipId}">
                        <rect x="${x - starSize/2}" y="${y - starSize/2}" width="${starSize * fillPercentage}" height="${starSize}"/>
                    </clipPath>
                </defs>
                <path d="${starPath}" transform="translate(${x}, ${y})" fill="${color}" stroke="${color}" stroke-width="1" clip-path="url(#${clipId})"/>
                <path d="${starPath}" transform="translate(${x}, ${y})" fill="none" stroke="#D1D5DB" stroke-width="1"/>
            `;
        } else {
            // Empty star (outline only)
            starsHTML += `<path d="${starPath}" transform="translate(${x}, ${y})" fill="none" stroke="#D1D5DB" stroke-width="1"/>`;
        }
    }
    
    const svg = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        ${starsHTML}
    </svg>`;
    
    return svg;
}

/**
 * Create a 5-pointed star path
 * 
 * @param {number} radius - Radius of the star
 * @returns {string} SVG path string
 */
function createStarPath(radius) {
    const points = [];
    const outerRadius = radius;
    const innerRadius = radius * 0.382; // Golden ratio for star proportions
    
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2; // Start from top
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        points.push(`${x},${y}`);
    }
    
    return `M ${points.join(' L ')} Z`;
} 