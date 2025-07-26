const fetch = require('node-fetch');

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
    const aspectRatio = queryParams.ratio || '5:1'; // Default aspect ratio
    const padding = parseInt(queryParams.padding) || 10; // Default padding
    const bgColor = queryParams.bgColor || queryParams.bg || 'transparent'; // Background color (transparent by default)
    const primaryColor = queryParams.primaryColor || queryParams.primary || '#3B82F6'; // Primary accent color
    const textColor = queryParams.textColor || queryParams.text || '#1F2937'; // Text color
    const subtextColor = queryParams.subtextColor || queryParams.subtext || '#6B7280'; // Subtitle text color
    
    // Validate padding
    if (padding < 0 || padding > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Padding must be between 0 and 100 pixels' }),
        };
    }
    
    // Validate color formats (allow 'transparent' for background)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const transparentRegex = /^transparent$/;
    if ((bgColor !== 'transparent' && !colorRegex.test(bgColor)) || !colorRegex.test(primaryColor) || !colorRegex.test(textColor) || !colorRegex.test(subtextColor)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex colors (e.g., #3B82F6) or "transparent" for background' }),
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
    
    // Calculate dimensions based on aspect ratio
    // For very wide aspect ratios, use a smaller base width to keep height reasonable
    let baseWidth = 400;
    let width = baseWidth;
    let height = Math.round((baseWidth * ratioHeight) / ratioWidth);
    
    // If height is too small, adjust base width to achieve minimum usable height
    if (height < 50) {
        baseWidth = Math.round((50 * ratioWidth) / ratioHeight);
        width = baseWidth;
        height = 50;
    }
    
    // Validate dimensions
    if (width < 200 || width > 800 || height < 50 || height > 600) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Calculated dimensions are out of valid range (200-800 width, 50-600 height)' }),
        };
    }
    
    // Layout calculations
    const imageSize = Math.min(height - (padding * 2), Math.min(100, height * 0.8)); // Max 100px or 80% of height, whichever is smaller
    const imageX = padding;
    const imageCenterX = imageX + imageSize / 2;
    
    // Content area (to the right of image)
    const contentX = imageX + imageSize + padding;
    const contentWidth = width - contentX - padding;
    
    // Text sizing
    const nameFontSize = Math.min(24, contentWidth / 12);
    const emailFontSize = Math.min(16, contentWidth / 18);
    const descFontSize = Math.min(14, contentWidth / 20);
    
    // -----------------------------------------------------------------------------
    //  Text‑block sizing
    // -----------------------------------------------------------------------------
    const gap = 4; // vertical gap between lines (px)
    const nameH = nameFontSize;                      // approx. line‑height per line
    const emailH = emailFontSize;
    const descH = description ? descFontSize : 0;
    const textBlockH = nameH + emailH + descH + gap * (description ? 2 : 1);
    const textTop = (height - textBlockH) / 2;       // top of the text block
    
    // Center the entire content area (image + text) vertically
    const totalHeight = Math.max(imageSize, textBlockH);
    const contentAreaStartY = (height - totalHeight) / 2;
    
    // Position image relative to the centered content area
    const imageY = contentAreaStartY + (totalHeight - imageSize) / 2;
    const imageCenterY = imageY + imageSize / 2;
    
    // Helper function to fetch image and convert to data URL
    const fetchImageAsDataURL = async (imageUrl) => {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`);
            }
            
            const buffer = await response.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const contentType = response.headers.get('content-type') || 'image/jpeg';
            
            return `data:${contentType};base64,${base64}`;
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };
    
    // Generate image element (with fallback to placeholder)
    let imageElement = '';
    if (image) {
        // Try to fetch the image and convert to data URL
        let imageDataURL = image;
        
        // If it's an external URL, try to fetch it
        if (image.startsWith('http://') || image.startsWith('https://')) {
            try {
                imageDataURL = await fetchImageAsDataURL(image);
            } catch (error) {
                console.error('Failed to fetch external image:', error);
                // Fall back to original URL if fetch fails
                imageDataURL = image;
            }
        }
        
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
                href="${imageDataURL}" 
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
    
    // Helper function to truncate text if too long
    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    };
    
    // Helper function to escape XML characters
    const escapeXML = (str) => {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    
    // Calculate max characters based on content width
    const nameMaxChars = Math.floor(contentWidth / (nameFontSize * 0.6));
    const emailMaxChars = Math.floor(contentWidth / (emailFontSize * 0.6));
    const descMaxChars = Math.floor(contentWidth / (descFontSize * 0.6));
    
    const displayName = truncateText(name, nameMaxChars);
    const displayEmail = truncateText(email, emailMaxChars);
    const displayDesc = truncateText(description, descMaxChars);
    
    const shadowId = `shadow-${Math.random().toString(36).substr(2, 9)}`;
    
    // -----------------------------------------------------------------------------
    //  SVG
    // -----------------------------------------------------------------------------
    const svgImage = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    .card-bg{fill:${bgColor}}
                    .name{
                        font-weight:600;
                        font-size:${nameFontSize}px;
                        font-family:Arial, sans-serif;
                        fill:${textColor};
                    }
                    .email{
                        font-weight:400;
                        font-size:${emailFontSize}px;
                        font-family:Arial, sans-serif;
                        fill:${primaryColor};
                    }
                    .desc{
                        font-weight:400;
                        font-size:${descFontSize}px;
                        font-family:Arial, sans-serif;
                        fill:${subtextColor};
                    }
                </style>
                ${bgColor && bgColor !== 'transparent' ? `
                <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity=".1"/>
                </filter>` : ''}
            </defs>
            
            ${bgColor && bgColor !== 'transparent'
                ? `<rect width="${width}" height="${height}" rx="12" class="card-bg" filter="url(#${shadowId})"/>`
                : ''}
            
            ${imageElement}
            
            <!-- Text block -->
            <g transform="translate(${contentX}, ${textTop})">
                <text y="${nameH}" class="name">${escapeXML(displayName)}</text>
                <text y="${nameH + gap + emailH}" class="email">${escapeXML(displayEmail)}</text>
                ${description ? `<text y="${nameH + gap + emailH + gap + descH}" class="desc">${escapeXML(displayDesc)}</text>` : ''}
            </g>
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