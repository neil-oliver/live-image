exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const image = queryParams.image || queryParams.avatar || ''; // User image URL
    const firstName = queryParams.firstName || queryParams.first_name || '';
    const lastName = queryParams.lastName || queryParams.last_name || '';
    const name = queryParams.name || (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || 'User Name');
    const email = queryParams.email || '';
    const description = queryParams.description || queryParams.title || queryParams.job || '';
    
    // Styling parameters
    const aspectRatio = queryParams.ratio || '16:9'; // Default aspect ratio
    const bgColor = queryParams.bgColor || queryParams.bg || '#FFFFFF'; // Background color
    const primaryColor = queryParams.primaryColor || queryParams.primary || '#3B82F6'; // Primary accent color
    const textColor = queryParams.textColor || queryParams.text || '#1F2937'; // Text color
    const subtextColor = queryParams.subtextColor || queryParams.subtext || '#6B7280'; // Subtitle text color
    
    // Validate color formats
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(bgColor) || !colorRegex.test(primaryColor) || !colorRegex.test(textColor) || !colorRegex.test(subtextColor)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex colors (e.g., #3B82F6)' }),
        };
    }
    
    // Parse aspect ratio
    const ratioMatch = aspectRatio.match(/^(\d+):(\d+)$/);
    if (!ratioMatch) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid aspect ratio format. Use format like 16:9 or 4:3' }),
        };
    }
    
    const ratioWidth = parseInt(ratioMatch[1]);
    const ratioHeight = parseInt(ratioMatch[2]);
    
    // Calculate dimensions based on aspect ratio (base width of 400px)
    const baseWidth = 400;
    const width = baseWidth;
    const height = Math.round((baseWidth * ratioHeight) / ratioWidth);
    
    // Validate dimensions
    if (width < 200 || width > 800 || height < 100 || height > 600) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Calculated dimensions are out of valid range (200-800 width, 100-600 height)' }),
        };
    }
    
    // Layout calculations
    const padding = 24;
    const imageSize = Math.min(height - (padding * 2), 120); // Max 120px circle
    const imageX = padding;
    const imageY = (height - imageSize) / 2;
    const imageCenterX = imageX + imageSize / 2;
    const imageCenterY = imageY + imageSize / 2;
    
    // Content area (to the right of image)
    const contentX = imageX + imageSize + padding;
    const contentWidth = width - contentX - padding;
    const contentY = padding;
    
    // Text sizing
    const nameFontSize = Math.min(24, contentWidth / 12);
    const emailFontSize = Math.min(16, contentWidth / 18);
    const descFontSize = Math.min(14, contentWidth / 20);
    
    // Generate image element (with fallback to placeholder)
    let imageElement = '';
    if (image) {
        // Use clipPath for circular image
        imageElement = `
            <defs>
                <clipPath id="circleClip">
                    <circle cx="${imageCenterX}" cy="${imageCenterY}" r="${imageSize / 2}" />
                </clipPath>
            </defs>
            <image 
                x="${imageX}" 
                y="${imageY}" 
                width="${imageSize}" 
                height="${imageSize}" 
                href="${image}" 
                clip-path="url(#circleClip)"
                preserveAspectRatio="xMidYMid slice"
            />
            <circle 
                cx="${imageCenterX}" 
                cy="${imageCenterY}" 
                r="${imageSize / 2}" 
                fill="none" 
                stroke="#E5E7EB" 
                stroke-width="2"
            />`;
    } else {
        // Placeholder avatar
        const iconSize = imageSize * 0.4;
        imageElement = `
            <circle 
                cx="${imageCenterX}" 
                cy="${imageCenterY}" 
                r="${imageSize / 2}" 
                fill="#F3F4F6" 
                stroke="#E5E7EB" 
                stroke-width="2"
            />
            <g transform="translate(${imageCenterX - iconSize/2}, ${imageCenterY - iconSize/2})">
                <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="${subtextColor}">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </g>`;
    }
    
    // Text positioning
    const nameY = contentY + nameFontSize + 8;
    const emailY = nameY + emailFontSize + 16;
    const descY = emailY + descFontSize + 12;
    
    // Helper function to truncate text if too long
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    };
    
    // Calculate max characters based on content width
    const nameMaxChars = Math.floor(contentWidth / (nameFontSize * 0.6));
    const emailMaxChars = Math.floor(contentWidth / (emailFontSize * 0.6));
    const descMaxChars = Math.floor(contentWidth / (descFontSize * 0.6));
    
    const displayName = truncateText(name, nameMaxChars);
    const displayEmail = truncateText(email, emailMaxChars);
    const displayDesc = truncateText(description, descMaxChars);
    
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .card-bg { fill: ${bgColor}; }
                    .name-text { font-family: 'Arial', sans-serif; font-weight: 600; font-size: ${nameFontSize}px; fill: ${textColor}; }
                    .email-text { font-family: 'Arial', sans-serif; font-weight: 400; font-size: ${emailFontSize}px; fill: ${primaryColor}; }
                    .desc-text { font-family: 'Arial', sans-serif; font-weight: 400; font-size: ${descFontSize}px; fill: ${subtextColor}; }
                </style>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.1"/>
                </filter>
            </defs>
            
            <!-- Card background with subtle shadow -->
            <rect 
                x="0" 
                y="0" 
                width="${width}" 
                height="${height}" 
                rx="12" 
                ry="12" 
                class="card-bg"
                filter="url(#shadow)"
            />
            
            <!-- User image or placeholder -->
            ${imageElement}
            
            <!-- User name -->
            <text 
                x="${contentX}" 
                y="${nameY}" 
                class="name-text"
            >
                ${displayName}
            </text>
            
            <!-- Email (if provided) -->
            ${email ? `
            <text 
                x="${contentX}" 
                y="${emailY}" 
                class="email-text"
            >
                ${displayEmail}
            </text>` : ''}
            
            <!-- Description (if provided) -->
            ${description ? `
            <text 
                x="${contentX}" 
                y="${email ? descY : emailY}" 
                class="desc-text"
            >
                ${displayDesc}
            </text>` : ''}
            
            <!-- Subtle accent line -->
            <rect 
                x="${contentX}" 
                y="${nameY + 8}" 
                width="32" 
                height="2" 
                rx="1" 
                fill="${primaryColor}"
                opacity="0.6"
            />
        </svg>
    `;

    try {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
                'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
            },
            body: svgImage,
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate user card SVG' }),
        };
    }
}; 