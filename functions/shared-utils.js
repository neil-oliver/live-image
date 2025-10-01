// Shared utilities for image generation functions

// Color manipulation utilities
function normalizeColor(color) {
    if (!color || color === 'currentColor') {
        return color;
    }
    
    // Check if it's a hex color without hash
    const hexWithoutHash = /^[A-Fa-f0-9]{6}$|^[A-Fa-f0-9]{3}$/;
    if (hexWithoutHash.test(color)) {
        return '#' + color;
    }
    
    // Return as-is for named colors, hex with hash, rgb(), hsl(), etc.
    return color;
}

// Convert hex to RGB
function hexToRgb(hex) {
    const normalized = normalizeColor(hex);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Convert RGB to hex
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Lighten a color by a percentage (0-100)
function lightenColor(hex, percent = 30) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    // Calculate lighter shade by moving towards white
    const r = rgb.r + (255 - rgb.r) * (percent / 100);
    const g = rgb.g + (255 - rgb.g) * (percent / 100);
    const b = rgb.b + (255 - rgb.b) * (percent / 100);
    
    return rgbToHex(r, g, b);
}

// Icon processing utilities
const svgCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Convert Lucide icon array to SVG string
function iconToSvg(iconData, options = {}) {
    const {
        color = 'currentColor',
        size = 24,
        strokeWidth = 2,
        fill = 'none',
        strokeLinecap = 'round',
        strokeLinejoin = 'round'
    } = options;

    // Convert icon data array to SVG elements
    const elements = iconData.map(([tag, attrs]) => {
        if (typeof tag === 'string' && attrs && typeof attrs === 'object') {
            const attrString = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            return `<${tag} ${attrString} />`;
        }
        return '';
    }).join('\n    ');

    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="${strokeLinecap}" stroke-linejoin="${strokeLinejoin}" xmlns="http://www.w3.org/2000/svg">
    ${elements}
</svg>`;
}

// Get processed SVG with caching
async function getProcessedSvg(iconName, options = {}) {
    const cacheKey = `svg-${iconName.toLowerCase()}-${JSON.stringify(options)}`;
    const cached = svgCache.get(cacheKey);
    
    // Return cached SVG if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    try {
        const lucide = require('lucide');
        const iconData = lucide[iconName];
        
        if (!iconData || !Array.isArray(iconData)) {
            return null;
        }
        
        // Process the icon data into SVG
        const svgString = iconToSvg(iconData, options);
        
        // Cache the result
        svgCache.set(cacheKey, {
            data: svgString,
            timestamp: Date.now()
        });
        
        return svgString;
    } catch (error) {
        // Cache null result to avoid repeated failed requests
        svgCache.set(cacheKey, {
            data: null,
            timestamp: Date.now()
        });
        return null;
    }
}

// Convert kebab-case to PascalCase for Lucide icon names
function toPascalCase(str) {
    return str
        .split('-')
        .map(word => {
            if (word.length === 1) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

// Get Lucide icon with name variations
async function getLucideIcon(iconName, options = {}) {
    const namesToTry = [
        toPascalCase(iconName),
        iconName,
        iconName.toLowerCase(),
        iconName.toUpperCase()
    ];
    
    for (const name of namesToTry) {
        const svg = await getProcessedSvg(name, options);
        if (svg) {
            return svg;
        }
    }
    
    return null;
}

module.exports = {
    normalizeColor,
    hexToRgb,
    rgbToHex,
    lightenColor,
    iconToSvg,
    getProcessedSvg,
    toPascalCase,
    getLucideIcon
};


