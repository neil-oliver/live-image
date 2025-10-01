const { lightenColor, normalizeColor, getLucideIcon } = require('./shared-utils');

const pillHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with new behavior:
    // - color = text color (breaking change from old version)
    // - backgroundColor = background color (optional, auto-generated if not provided)
    const text = queryParams.text || 'Pill';
    const textColor = normalizeColor(queryParams.color || queryParams.textColor || '#3B82F6');
    const backgroundColor = queryParams.backgroundColor 
        ? normalizeColor(queryParams.backgroundColor)
        : lightenColor(textColor, 85); // Generate lighter shade (85% lighter)
    
    const padding = parseInt(queryParams.padding) || 12;
    const verticalPadding = parseInt(queryParams.verticalPadding) || 6;
    
    // Icon parameters
    const iconName = queryParams.icon || '';
    const iconPosition = (queryParams.iconPosition || 'left').toLowerCase();
    const iconSize = parseInt(queryParams.iconSize) || 16;
    const iconSpacing = parseInt(queryParams.iconSpacing) || 8;
    
    // Validate color format (basic hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(textColor) || !colorRegex.test(backgroundColor)) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6)' }),
        };
    }
    
    // Validate padding
    if (padding < 0 || padding > 200 || verticalPadding < 0 || verticalPadding > 100) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Padding must be between 0-200 (horizontal) and 0-100 (vertical) pixels' }),
        };
    }
    
    // Validate icon position
    if (iconPosition !== 'left' && iconPosition !== 'right') {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'iconPosition must be "left" or "right"' }),
        };
    }
    
    // Calculate dimensions
    const fontSize = 16;
    const textWidth = text.length * fontSize * 0.6;
    
    // If icon is present, add space for it
    let iconSvg = null;
    let iconWidth = 0;
    
    if (iconName) {
        try {
            iconSvg = await getLucideIcon(iconName, {
                color: textColor,
                size: iconSize,
                strokeWidth: 2
            });
            
            // If icon is found, add spacing for it
            if (iconSvg) {
                iconWidth = iconSize + iconSpacing;
            }
            // If icon is not found, just ignore it (iconWidth stays 0)
        } catch (error) {
            // If icon fails to load, just ignore it and continue without icon
            iconSvg = null;
        }
    }
    
    const pillWidth = Math.max(100, textWidth + (padding * 2) + iconWidth);
    const pillHeight = Math.max(fontSize, iconSize) + (verticalPadding * 2);
    const borderRadius = pillHeight / 2;
    
    // SVG dimensions with margin
    const svgWidth = pillWidth + 40;
    const svgHeight = pillHeight + 40;
    
    // Calculate positions
    const pillX = 20;
    const pillY = 20;
    const pillCenterY = pillY + pillHeight / 2;
    
    let textX, iconX;
    
    if (iconSvg) {
        if (iconPosition === 'left') {
            iconX = pillX + padding;
            textX = iconX + iconSize + iconSpacing;
        } else {
            textX = pillX + padding;
            iconX = textX + textWidth + iconSpacing;
        }
    } else {
        textX = pillX + pillWidth / 2;
    }
    
    // Build SVG
    const svgImage = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <!-- Flat pill background -->
            <rect 
                x="${pillX}" 
                y="${pillY}" 
                width="${pillWidth}" 
                height="${pillHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="${backgroundColor}" 
                stroke="none"
            />
            
            ${iconSvg ? `
            <!-- Icon -->
            <svg x="${iconX}" y="${pillCenterY - iconSize / 2}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${iconSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
            </svg>
            ` : ''}
            
            <!-- Text -->
            <text 
                x="${textX}" 
                y="${pillCenterY + fontSize / 3}" 
                ${iconSvg ? '' : 'text-anchor="middle"'}
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
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*'
            },
            body: svgImage.trim(),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Failed to generate pill SVG', details: error.message }),
        };
    }
};

exports.handler = pillHandler;
