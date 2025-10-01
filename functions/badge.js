const { lightenColor, normalizeColor, getLucideIcon } = require('./shared-utils');

const badgeHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with new behavior:
    // - color = text color (breaking change from old version)
    // - backgroundColor = background color (optional, auto-generated if not provided)
    const text = queryParams.text || '';
    const textColor = normalizeColor(queryParams.color || queryParams.textColor || '#3B82F6');
    const backgroundColor = queryParams.backgroundColor 
        ? normalizeColor(queryParams.backgroundColor)
        : lightenColor(textColor, 85); // Generate lighter shade (85% lighter)
    
    const padding = parseInt(queryParams.padding) || 8;
    const verticalPadding = parseInt(queryParams.verticalPadding) || 6;
    const radius = queryParams.radius ? parseInt(queryParams.radius) : null; // null = auto (pill-shaped)
    
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
    const textWidth = text ? text.length * fontSize * 0.5 : 0;
    
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
                iconWidth = iconSize + (text ? iconSpacing : 0);
            }
            // If icon is not found, just ignore it (iconWidth stays 0)
        } catch (error) {
            // If icon fails to load, just ignore it and continue without icon
            iconSvg = null;
        }
    }
    
    const badgeWidth = Math.max(text || iconSvg ? 0 : 100, textWidth + (padding * 2) + iconWidth);
    const badgeHeight = Math.max(fontSize, iconSize) + (verticalPadding * 2);
    const borderRadius = radius !== null ? radius : badgeHeight / 2; // Use custom radius or auto (fully rounded)
    
    // SVG dimensions with margin
    const svgWidth = badgeWidth + 40;
    const svgHeight = badgeHeight + 40;
    
    // Calculate positions
    const badgeX = 20;
    const badgeY = 20;
    const badgeCenterY = badgeY + badgeHeight / 2;
    
    let textX, iconX;
    
    if (iconSvg && text) {
        // Both icon and text
        if (iconPosition === 'left') {
            iconX = badgeX + padding;
            textX = iconX + iconSize + iconSpacing;
        } else {
            textX = badgeX + padding;
            iconX = textX + textWidth + iconSpacing;
        }
    } else if (iconSvg) {
        // Icon only (no text)
        iconX = badgeX + badgeWidth / 2 - iconSize / 2;
    } else {
        // Text only (no icon)
        textX = badgeX + badgeWidth / 2;
    }
    
    // Build SVG
    const svgImage = `
        <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <!-- Badge background -->
            <rect 
                x="${badgeX}" 
                y="${badgeY}" 
                width="${badgeWidth}" 
                height="${badgeHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="${backgroundColor}" 
                stroke="none"
            />
            
            ${iconSvg ? `
            <!-- Icon -->
            <svg x="${iconX}" y="${badgeCenterY - iconSize / 2}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${iconSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
            </svg>
            ` : ''}
            
            ${text ? `
            <!-- Text -->
            <text 
                x="${textX}" 
                y="${badgeCenterY + fontSize / 3}" 
                ${iconSvg && text ? '' : 'text-anchor="middle"'}
                font-size="${fontSize}" 
                font-family="Arial, sans-serif"
                font-weight="500"
                fill="${textColor}"
            >
                ${text}
            </text>
            ` : ''}
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
            body: JSON.stringify({ error: 'Failed to generate badge SVG', details: error.message }),
        };
    }
};

exports.handler = badgeHandler;

