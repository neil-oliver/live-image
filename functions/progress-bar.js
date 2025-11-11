
// Removed builder import - was causing Method Not Allowed errors

const progressBarHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const value = Math.max(0, Math.min(100, queryParams.value !== undefined ? parseFloat(queryParams.value) : 50)); // 0-100, default 50
    const colorParam = queryParams.color || '#3B82F6'; // Default blue color
    const backgroundColorParam = queryParams.bg || queryParams.bgColor || '#E5E7EB'; // Remaining track color
    // Gradient span behavior: 'bar' (default) or 'progress'
    const gradientSpanParamRaw = (queryParams.gradientSpan || queryParams.gradientScope || 'bar');
    const gradientSpan = typeof gradientSpanParamRaw === 'string' ? gradientSpanParamRaw.toLowerCase() : 'bar';
    const aspectRatio = parseFloat(queryParams.aspectRatio) || 4; // Default 4:1 aspect ratio
    const padding = parseInt(queryParams.padding) || 20; // Default padding
    const radius = queryParams.radius ? parseInt(queryParams.radius) : null; // null = auto (fully rounded)
    const segments = Math.max(1, Math.min(50, parseInt(queryParams.segments) || 1)); // Number of segments
    const gap = Math.max(0, Math.min(20, parseInt(queryParams.gap) || 4)); // Gap between segments
    
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
    
    // Validate padding
    if (padding < 0 || padding > 100) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Padding must be between 0 and 100 pixels' }),
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
    const borderRadius = radius !== null ? radius : barHeight / 2; // Use custom radius or auto (fully rounded)
    
    // Calculate progress width
    const progressWidth = (value / 100) * (width - (padding * 2)); // Leave padding on each side
    
    // Build gradient stops if multiple colors are provided
    const hasGradient = colors.length > 1;
    const gradientStops = hasGradient
        ? colors.map((c, i) => {
            const offset = colors.length === 1 ? 100 : (i / (colors.length - 1)) * 100;
            return `<stop offset="${offset}%" stop-color="${c}" />`;
        }).join('')
        : '';

    // Determine gradient coordinates based on gradient span behavior
    const gradientStartX = padding;
    const gradientEndX = gradientSpan === 'bar' ? (width - padding) : (padding + progressWidth);
    const gradientY = barY;

    // Render segments
    let segmentElements = '';
    
    if (segments > 1) {
        // Calculate segment dimensions
        const totalBarWidth = width - (padding * 2);
        const totalGapSpace = (segments - 1) * gap;
        const segmentWidth = (totalBarWidth - totalGapSpace) / segments;
        
        // Calculate how many full segments to show and the partial segment progress
        const progressPerSegment = 100 / segments;
        const fullSegments = Math.floor(value / progressPerSegment);
        const partialSegmentProgress = (value % progressPerSegment) / progressPerSegment;
        
        // Render each segment
        for (let i = 0; i < segments; i++) {
            const segmentX = padding + (i * (segmentWidth + gap));
            
            // Determine if this segment should be filled
            let segmentFillWidth = 0;
            if (i < fullSegments) {
                // Full segment
                segmentFillWidth = segmentWidth;
            } else if (i === fullSegments && partialSegmentProgress > 0) {
                // Partial segment
                segmentFillWidth = segmentWidth * partialSegmentProgress;
            }
            
            if (segmentFillWidth > 0) {
                // Calculate color for this segment based on its position
                const segmentPositionPercent = segments === 1 ? 0 : (i / (segments - 1)) * 100;
                const segmentColor = getColorFromGradient(colors, segmentPositionPercent);
                
                // Determine border radius for this segment
                // For segmented bars, each segment has independent rounded corners
                let segmentRadius = 0;
                
                if (radius !== null) {
                    // Custom radius specified
                    segmentRadius = Math.min(radius, barHeight / 2, segmentWidth / 2);
                } else {
                    // Auto radius (fully rounded for each segment)
                    segmentRadius = Math.min(barHeight / 2, segmentWidth / 2);
                }
                
                // Determine if this is a full or partial segment fill
                const isFullSegment = segmentFillWidth >= segmentWidth * 0.99; // Allow small floating point errors
                const rightRadius = isFullSegment ? segmentRadius : 0; // Only round right corners if fully filled
                
                // Ensure radii don't exceed available space
                const actualLeftRadius = Math.min(segmentRadius, segmentFillWidth / 2, barHeight / 2);
                const actualRightRadius = Math.min(rightRadius, segmentFillWidth / 2, barHeight / 2);
                
                // Generate rect with border radius (simpler than path for most cases)
                if (actualLeftRadius === actualRightRadius) {
                    // Uniform radius - use simple rect
                    segmentElements += `
                        <rect 
                            x="${segmentX}" 
                            y="${barY}" 
                            width="${segmentFillWidth}" 
                            height="${barHeight}" 
                            rx="${actualLeftRadius}" 
                            ry="${actualLeftRadius}" 
                            fill="${segmentColor}" 
                            stroke="none"
                        />
                    `;
                } else {
                    // Different radii on left/right - use path for more control
                    const pathD = `
                        M ${segmentX + actualLeftRadius},${barY}
                        L ${segmentX + segmentFillWidth - actualRightRadius},${barY}
                        ${actualRightRadius > 0 ? `Q ${segmentX + segmentFillWidth},${barY} ${segmentX + segmentFillWidth},${barY + actualRightRadius}` : ''}
                        L ${segmentX + segmentFillWidth},${barY + barHeight - actualRightRadius}
                        ${actualRightRadius > 0 ? `Q ${segmentX + segmentFillWidth},${barY + barHeight} ${segmentX + segmentFillWidth - actualRightRadius},${barY + barHeight}` : ''}
                        L ${segmentX + actualLeftRadius},${barY + barHeight}
                        ${actualLeftRadius > 0 ? `Q ${segmentX},${barY + barHeight} ${segmentX},${barY + barHeight - actualLeftRadius}` : ''}
                        L ${segmentX},${barY + actualLeftRadius}
                        ${actualLeftRadius > 0 ? `Q ${segmentX},${barY} ${segmentX + actualLeftRadius},${barY}` : ''}
                        Z
                    `;
                    
                    segmentElements += `
                        <path d="${pathD.replace(/\s+/g, ' ').trim()}" fill="${segmentColor}" stroke="none" />
                    `;
                }
            }
        }
        
        // Render background segments
        let backgroundSegments = '';
        for (let i = 0; i < segments; i++) {
            const segmentX = padding + (i * (segmentWidth + gap));
            
            // Calculate border radius for background segments (same logic as filled segments)
            let segmentRadius = 0;
            
            if (radius !== null) {
                // Custom radius specified
                segmentRadius = Math.min(radius, barHeight / 2, segmentWidth / 2);
            } else {
                // Auto radius (fully rounded for each segment)
                segmentRadius = Math.min(barHeight / 2, segmentWidth / 2);
            }
            
            backgroundSegments += `
                <rect 
                    x="${segmentX}" 
                    y="${barY}" 
                    width="${segmentWidth}" 
                    height="${barHeight}" 
                    rx="${segmentRadius}" 
                    ry="${segmentRadius}" 
                    fill="${backgroundColorParam}" 
                    stroke="none"
                />
            `;
        }
        
        const svgImage = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <!-- Background segments -->
                ${backgroundSegments}
                
                <!-- Filled segments -->
                ${segmentElements}
            </svg>
        `;
        
        try {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=2592000', // 1 month since it's cached at edge
                },
                body: svgImage,
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to generate progress bar SVG' }),
            };
        }
    }

    // Original single-bar rendering (when segments === 1)
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
                x="${padding}" 
                y="${barY}" 
                width="${width - (padding * 2)}" 
                height="${barHeight}" 
                rx="${borderRadius}" 
                ry="${borderRadius}" 
                fill="${backgroundColorParam}" 
                stroke="none"
            />
            
            <!-- Progress bar (colored) -->
            <rect 
                x="${padding}" 
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
                'Cache-Control': 'public, max-age=2592000', // 1 month since it's cached at edge
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

exports.handler = progressBarHandler; 