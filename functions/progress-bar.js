
// Removed builder import - was causing Method Not Allowed errors

const progressBarHandler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    // Note: If 'values' is provided, we'll ignore the 'value' parameter
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
    
    // Check if values parameter was explicitly provided (even if empty or all zeros)
    const valuesProvided = queryParams.values !== undefined;
    
    // Parse colors - can be single color or comma-separated list
    let colors = [];
    if (colorParam.includes(',')) {
        // Multiple colors provided
        colors = colorParam.split(',').map(c => c.trim());
    } else {
        // Single color provided
        colors = [colorParam];
    }
    
    // Multi-value support: allows creating stacked progress sections with different colors
    // Format: values=30,20,10 (uses colors from the color parameter in order)
    // Also supports legacy format: values=30:#FF0000,20:#00FF00,10:#0000FF (value:color pairs)
    let multiValues = null;
    if (queryParams.values) {
        try {
            multiValues = [];
            const pairs = queryParams.values.split(',');
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i].trim();
                
                // Check if this is the legacy format (value:color)
                if (pair.includes(':')) {
                    const [val, col] = pair.split(':');
                    const parsedValue = parseFloat(val);
                    const parsedColor = col || '#3B82F6';
                    if (!isNaN(parsedValue) && parsedValue > 0) {
                        multiValues.push({ value: parsedValue, color: parsedColor });
                    }
                } else {
                    // New simplified format (just values, use colors from color parameter)
                    const parsedValue = parseFloat(pair);
                    if (!isNaN(parsedValue) && parsedValue > 0) {
                        // Use corresponding color from colors array, or cycle through if not enough colors
                        const colorIndex = i % colors.length;
                        multiValues.push({ value: parsedValue, color: colors[colorIndex] });
                    }
                }
            }
            // If we didn't parse any valid values, set to null
            if (multiValues.length === 0) {
                multiValues = null;
            }
        } catch (e) {
            multiValues = null;
        }
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
        
        // Render each segment with smart rounding
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
                let baseSegmentRadius = 0;
                
                if (radius !== null) {
                    // Custom radius specified
                    baseSegmentRadius = Math.min(radius, barHeight / 2, segmentWidth / 2);
                } else {
                    // Auto radius (fully rounded for each segment)
                    baseSegmentRadius = Math.min(barHeight / 2, segmentWidth / 2);
                }
                
                // Smart rounding logic for professional appearance:
                // - First filled segment: round left edge only
                // - Middle filled segments: no rounding
                // - Last filled segment: round right edge only if it's full
                const isFirstFilledSegment = i === 0 || (i > 0 && i <= fullSegments);
                const isFullSegment = segmentFillWidth >= segmentWidth * 0.99; // Allow small floating point errors
                const isLastFilledSegment = (i === fullSegments);
                
                let leftRadius = 0;
                let rightRadius = 0;
                
                // Only round edges that are "terminal" (at the start or end of the filled region)
                if (i === 0) {
                    // First segment in the bar - round left
                    leftRadius = baseSegmentRadius;
                }
                
                if (isLastFilledSegment && isFullSegment) {
                    // Last filled segment and it's full - round right
                    rightRadius = baseSegmentRadius;
                }
                
                // Ensure radii don't exceed available space
                const actualLeftRadius = Math.min(leftRadius, segmentFillWidth / 2, barHeight / 2);
                const actualRightRadius = Math.min(rightRadius, segmentFillWidth / 2, barHeight / 2);
                
                // Generate path or rect based on rounding needs
                if (actualLeftRadius === 0 && actualRightRadius === 0) {
                    // No rounding - use simple rect
                    segmentElements += `
                        <rect 
                            x="${segmentX}" 
                            y="${barY}" 
                            width="${segmentFillWidth}" 
                            height="${barHeight}" 
                            fill="${segmentColor}" 
                            stroke="none"
                        />
                    `;
                } else if (actualLeftRadius === actualRightRadius && actualLeftRadius > 0) {
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
                    // Different radii on left/right - use path for selective rounding
                    const x1 = segmentX;
                    const x2 = segmentX + segmentFillWidth;
                    const y1 = barY;
                    const y2 = barY + barHeight;
                    
                    const pathD = `
                        M ${x1 + actualLeftRadius},${y1}
                        L ${x2 - actualRightRadius},${y1}
                        ${actualRightRadius > 0 ? `Q ${x2},${y1} ${x2},${y1 + actualRightRadius}` : `L ${x2},${y1}`}
                        L ${x2},${y2 - actualRightRadius}
                        ${actualRightRadius > 0 ? `Q ${x2},${y2} ${x2 - actualRightRadius},${y2}` : `L ${x2},${y2}`}
                        L ${x1 + actualLeftRadius},${y2}
                        ${actualLeftRadius > 0 ? `Q ${x1},${y2} ${x1},${y2 - actualLeftRadius}` : `L ${x1},${y2}`}
                        L ${x1},${y1 + actualLeftRadius}
                        ${actualLeftRadius > 0 ? `Q ${x1},${y1} ${x1 + actualLeftRadius},${y1}` : `L ${x1},${y1}`}
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
    
    // Multi-value progress bar rendering (stacked sections with different colors)
    // If values parameter was provided but resulted in no valid sections (all zeros), render empty bar
    if (valuesProvided && segments === 1) {
        if (!multiValues || multiValues.length === 0) {
            // Values parameter was provided but all values were zero or invalid
            // Render just the background bar (empty progress)
            const svgImage = `
                <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <!-- Background bar -->
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
                </svg>
            `;
            
            try {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Cache-Control': 'public, max-age=2592000',
                    },
                    body: svgImage,
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to generate empty progress bar SVG' }),
                };
            }
        }
        
        // Valid multi-value sections exist, render them
        // Calculate total value and validate
        let totalValue = 0;
        for (const section of multiValues) {
            totalValue += section.value;
        }
        
        // Cap total at 100%
        totalValue = Math.min(totalValue, 100);
        
        // Render each section
        let sectionElements = '';
        let currentX = padding;
        
        for (let i = 0; i < multiValues.length; i++) {
            const section = multiValues[i];
            const sectionWidth = (section.value / 100) * (width - (padding * 2));
            
            if (sectionWidth > 0) {
                // Validate color
                const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                const sectionColor = colorRegex.test(section.color) ? section.color : '#3B82F6';
                
                // Smart rounding: only round terminal edges
                let leftRadius = 0;
                let rightRadius = 0;
                
                if (i === 0) {
                    // First section - round left edge
                    leftRadius = borderRadius;
                }
                
                if (i === multiValues.length - 1 || currentX + sectionWidth >= width - padding - 1) {
                    // Last section or reaches the end - round right edge
                    rightRadius = borderRadius;
                }
                
                // Ensure radii don't exceed available space
                const actualLeftRadius = Math.min(leftRadius, sectionWidth / 2, barHeight / 2);
                const actualRightRadius = Math.min(rightRadius, sectionWidth / 2, barHeight / 2);
                
                // Generate path or rect based on rounding needs
                if (actualLeftRadius === 0 && actualRightRadius === 0) {
                    // No rounding - use simple rect
                    sectionElements += `
                        <rect 
                            x="${currentX}" 
                            y="${barY}" 
                            width="${sectionWidth}" 
                            height="${barHeight}" 
                            fill="${sectionColor}" 
                            stroke="none"
                        />
                    `;
                } else if (actualLeftRadius === actualRightRadius && actualLeftRadius > 0) {
                    // Uniform radius - use simple rect
                    sectionElements += `
                        <rect 
                            x="${currentX}" 
                            y="${barY}" 
                            width="${sectionWidth}" 
                            height="${barHeight}" 
                            rx="${actualLeftRadius}" 
                            ry="${actualLeftRadius}" 
                            fill="${sectionColor}" 
                            stroke="none"
                        />
                    `;
                } else {
                    // Selective rounding - use path
                    const x1 = currentX;
                    const x2 = currentX + sectionWidth;
                    const y1 = barY;
                    const y2 = barY + barHeight;
                    
                    const pathD = `
                        M ${x1 + actualLeftRadius},${y1}
                        L ${x2 - actualRightRadius},${y1}
                        ${actualRightRadius > 0 ? `Q ${x2},${y1} ${x2},${y1 + actualRightRadius}` : `L ${x2},${y1}`}
                        L ${x2},${y2 - actualRightRadius}
                        ${actualRightRadius > 0 ? `Q ${x2},${y2} ${x2 - actualRightRadius},${y2}` : `L ${x2},${y2}`}
                        L ${x1 + actualLeftRadius},${y2}
                        ${actualLeftRadius > 0 ? `Q ${x1},${y2} ${x1},${y2 - actualLeftRadius}` : `L ${x1},${y2}`}
                        L ${x1},${y1 + actualLeftRadius}
                        ${actualLeftRadius > 0 ? `Q ${x1},${y1} ${x1 + actualLeftRadius},${y1}` : `L ${x1},${y1}`}
                        Z
                    `;
                    
                    sectionElements += `
                        <path d="${pathD.replace(/\s+/g, ' ').trim()}" fill="${sectionColor}" stroke="none" />
                    `;
                }
                
                currentX += sectionWidth;
                
                // Stop if we've reached the end of the bar
                if (currentX >= width - padding) break;
            }
        }
        
        const svgImage = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <!-- Background bar -->
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
                
                <!-- Multi-value sections -->
                ${sectionElements}
            </svg>
        `;
        
        try {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=2592000',
                },
                body: svgImage,
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to generate multi-value progress bar SVG' }),
            };
        }
    }

    // Original single-bar rendering (when segments === 1)
    // Smart border radius: only round right edge when progress is nearly complete (>= 95%)
    const shouldRoundRight = value >= 95;
    const leftRadius = borderRadius;
    const rightRadius = shouldRoundRight ? borderRadius : 0;
    
    // Build progress bar path with selective rounding
    let progressPath = '';
    if (progressWidth > 0) {
        if (leftRadius === 0 && rightRadius === 0) {
            // No rounding at all - use simple rect
            progressPath = `<rect 
                x="${padding}" 
                y="${barY}" 
                width="${progressWidth}" 
                height="${barHeight}" 
                fill="${hasGradient ? 'url(#gradProgress)' : currentColor}" 
                stroke="none"
            />`;
        } else if (leftRadius > 0 && rightRadius === 0) {
            // Only left side rounded - use rect with rx/ry clipped on right
            // For very small progress, we need special handling
            const actualLeftRadius = Math.min(leftRadius, barHeight / 2);
            
            if (progressWidth < actualLeftRadius * 2) {
                // Progress is too narrow for full radius - use a circle/semi-circle approach
                const centerX = padding + progressWidth / 2;
                const radiusX = Math.min(progressWidth / 2, barHeight / 2);
                const radiusY = barHeight / 2;
                
                progressPath = `<ellipse 
                    cx="${centerX}" 
                    cy="${barY + barHeight / 2}" 
                    rx="${radiusX}" 
                    ry="${radiusY}" 
                    fill="${hasGradient ? 'url(#gradProgress)' : currentColor}" 
                    stroke="none"
                />`;
            } else {
                // Use path with left rounding only
                const x1 = padding;
                const x2 = padding + progressWidth;
                const y1 = barY;
                const y2 = barY + barHeight;
                
                const pathD = `
                    M ${x1 + actualLeftRadius},${y1}
                    L ${x2},${y1}
                    L ${x2},${y2}
                    L ${x1 + actualLeftRadius},${y2}
                    Q ${x1},${y2} ${x1},${y2 - actualLeftRadius}
                    L ${x1},${y1 + actualLeftRadius}
                    Q ${x1},${y1} ${x1 + actualLeftRadius},${y1}
                    Z
                `;
                
                progressPath = `<path d="${pathD.replace(/\s+/g, ' ').trim()}" fill="${hasGradient ? 'url(#gradProgress)' : currentColor}" stroke="none" />`;
            }
        } else {
            // Both sides rounded or other cases - use full path logic
            const actualLeftRadius = Math.min(leftRadius, progressWidth / 2, barHeight / 2);
            const actualRightRadius = Math.min(rightRadius, progressWidth / 2, barHeight / 2);
            
            const x1 = padding;
            const x2 = padding + progressWidth;
            const y1 = barY;
            const y2 = barY + barHeight;
            
            const pathD = `
                M ${x1 + actualLeftRadius},${y1}
                L ${x2 - actualRightRadius},${y1}
                ${actualRightRadius > 0 ? `Q ${x2},${y1} ${x2},${y1 + actualRightRadius}` : `L ${x2},${y1}`}
                L ${x2},${y2 - actualRightRadius}
                ${actualRightRadius > 0 ? `Q ${x2},${y2} ${x2 - actualRightRadius},${y2}` : `L ${x2},${y2}`}
                L ${x1 + actualLeftRadius},${y2}
                Q ${x1},${y2} ${x1},${y2 - actualLeftRadius}
                L ${x1},${y1 + actualLeftRadius}
                Q ${x1},${y1} ${x1 + actualLeftRadius},${y1}
                Z
            `;
            
            progressPath = `<path d="${pathD.replace(/\s+/g, ' ').trim()}" fill="${hasGradient ? 'url(#gradProgress)' : currentColor}" stroke="none" />`;
        }
    }
    
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
            
            <!-- Progress bar (colored) with smart rounding -->
            ${progressPath}
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