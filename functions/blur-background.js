exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const width = parseInt(queryParams.width) || 800;
    const height = parseInt(queryParams.height) || 600;
    const complexity = parseInt(queryParams.complexity) || 5; // Number of blob elements
    const palette = queryParams.palette || 'warm'; // Color palette theme
    const blur = parseInt(queryParams.blur) || 60; // Blur intensity
    const seed = queryParams.seed || Math.random().toString(36); // For reproducible results
    
    // Validate dimensions
    if (width < 100 || width > 2000 || height < 100 || height > 2000) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Width and height must be between 100 and 2000 pixels' }),
        };
    }
    
    if (complexity < 2 || complexity > 15) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Complexity must be between 2 and 15' }),
        };
    }
    
    // Simple seeded random number generator for reproducible results
    class SeededRandom {
        constructor(seed) {
            this.m = 0x80000000; // 2**31
            this.a = 1103515245;
            this.c = 12345;
            this.state = seed ? this.hash(seed) : Math.floor(Math.random() * (this.m - 1));
        }
        
        hash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return Math.abs(hash);
        }
        
        next() {
            this.state = (this.a * this.state + this.c) % this.m;
            return this.state / (this.m - 1);
        }
        
        range(min, max) {
            return min + this.next() * (max - min);
        }
    }
    
    const rng = new SeededRandom(seed);
    
    // Color palettes for different themes
    const colorPalettes = {
        warm: [
            '#FF6B6B', '#FF8E53', '#FF6B9D', '#C44569',
            '#F8B500', '#FF7675', '#FD79A8', '#E84393'
        ],
        cool: [
            '#74B9FF', '#0984E3', '#6C5CE7', '#A29BFE',
            '#00CEC9', '#55A3FF', '#5F27CD', '#00D2D3'
        ],
        sunset: [
            '#FF9FF3', '#F368E0', '#FF6B35', '#F7931E',
            '#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1'
        ],
        ocean: [
            '#3742FA', '#2F3542', '#40407A', '#706FD3',
            '#33D9B2', '#218C74', '#0652DD', '#1B1464'
        ],
        pastel: [
            '#FFB3E6', '#FFE5B4', '#B4E5FF', '#E5B4FF',
            '#B4FFB4', '#FFB4B4', '#FFE4B5', '#E1BEE7'
        ],
        vibrant: [
            '#FF3838', '#FF9500', '#FFDD00', '#00FF94',
            '#00C9FF', '#6A4C93', '#FF006E', '#8338EC'
        ]
    };
    
    const selectedColors = colorPalettes[palette] || colorPalettes.warm;
    
    // Generate organic blob shape using SVG path
    const generateBlobPath = (centerX, centerY, baseRadius) => {
        const points = 8; // Number of control points
        const angleStep = (2 * Math.PI) / points;
        let path = '';
        
        const controlPoints = [];
        for (let i = 0; i < points; i++) {
            const angle = i * angleStep;
            const radiusVariation = rng.range(0.7, 1.3);
            const radius = baseRadius * radiusVariation;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            controlPoints.push({ x, y });
        }
        
        // Create smooth curve using cubic bezier
        path = `M ${controlPoints[0].x},${controlPoints[0].y}`;
        
        for (let i = 0; i < points; i++) {
            const current = controlPoints[i];
            const next = controlPoints[(i + 1) % points];
            const nextNext = controlPoints[(i + 2) % points];
            
            // Calculate control points for smooth curve
            const cp1x = current.x + (next.x - controlPoints[(i - 1 + points) % points].x) * 0.15;
            const cp1y = current.y + (next.y - controlPoints[(i - 1 + points) % points].y) * 0.15;
            const cp2x = next.x - (nextNext.x - current.x) * 0.15;
            const cp2y = next.y - (nextNext.y - current.y) * 0.15;
            
            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
        }
        
        path += ' Z';
        return path;
    };
    
    // Generate blob elements
    const blobs = [];
    for (let i = 0; i < complexity; i++) {
        const color = selectedColors[Math.floor(rng.next() * selectedColors.length)];
        const centerX = rng.range(-width * 0.2, width * 1.2);
        const centerY = rng.range(-height * 0.2, height * 1.2);
        const radius = rng.range(Math.min(width, height) * 0.2, Math.min(width, height) * 0.6);
        const opacity = rng.range(0.3, 0.8);
        
        const path = generateBlobPath(centerX, centerY, radius);
        
        blobs.push({
            path,
            color,
            opacity,
            id: `blob-${i}`
        });
    }
    
    // Generate additional smaller accent blobs
    const accentBlobs = [];
    const accentCount = Math.floor(complexity * 1.5);
    for (let i = 0; i < accentCount; i++) {
        const color = selectedColors[Math.floor(rng.next() * selectedColors.length)];
        const centerX = rng.range(-width * 0.1, width * 1.1);
        const centerY = rng.range(-height * 0.1, height * 1.1);
        const radius = rng.range(Math.min(width, height) * 0.1, Math.min(width, height) * 0.3);
        const opacity = rng.range(0.2, 0.5);
        
        const path = generateBlobPath(centerX, centerY, radius);
        
        accentBlobs.push({
            path,
            color,
            opacity,
            id: `accent-${i}`
        });
    }
    
    // Create SVG with blur effects
    const svgContent = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- Blur filter for main blobs -->
        <filter id="blur-main" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" />
        </filter>
        
        <!-- Stronger blur for accent blobs -->
        <filter id="blur-accent" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${blur * 1.5}" />
        </filter>
        
        <!-- Gradient overlay for depth -->
        <radialGradient id="depth-gradient" cx="50%" cy="40%" r="80%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:black;stop-opacity:0.1" />
        </radialGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="#f8fafc" />
    
    <!-- Main blobs with blur -->
    <g filter="url(#blur-main)">
        ${blobs.map(blob => `
        <path d="${blob.path}" 
              fill="${blob.color}" 
              opacity="${blob.opacity}" />
        `).join('')}
    </g>
    
    <!-- Accent blobs with stronger blur -->
    <g filter="url(#blur-accent)">
        ${accentBlobs.map(blob => `
        <path d="${blob.path}" 
              fill="${blob.color}" 
              opacity="${blob.opacity}" />
        `).join('')}
    </g>
    
    <!-- Subtle depth overlay -->
    <rect width="${width}" height="${height}" fill="url(#depth-gradient)" />
</svg>`;

    try {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: svgContent.trim(),
        };
    } catch (error) {
        console.error('Error generating blur background:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                error: 'Failed to generate blur background',
                details: error.message 
            }),
        };
    }
};
