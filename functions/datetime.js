exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const timestampInput = queryParams.timestamp || Date.now(); // Default to current timestamp
    const size = parseInt(queryParams.size) || 128; // Default size
    const padding = parseInt(queryParams.padding) || 10; // Default padding
    const header = queryParams.header || "#EF5350"; // Default header color
    const stroke = queryParams.stroke || "#0B0B0B"; // Default stroke color
    
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
    
    // Validate colors (hex validation)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(header) || !colorRegex.test(stroke)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid color format. Use hex colors (e.g., #EF5350)' }),
        };
    }
    
    try {
        // Parse timestamp input
        let timestamp = parseInt(timestampInput);
        if (isNaN(timestamp) || timestamp < 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid timestamp. Must be a positive integer' }),
            };
        }
        
        // Convert seconds to milliseconds if timestamp is in seconds (10 digits or less)
        if (timestamp.toString().length <= 10) {
            timestamp = timestamp * 1000;
        }
        
        // Generate SVG
        const svg = createCalendarClockSVG(timestamp, { size, padding, header, stroke });
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
                'Access-Control-Allow-Origin': '*'
            },
            body: svg
        };
        
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate datetime image', details: error.message }),
        };
    }
};

/**
 * Build an SVG calendar‑plus‑clock icon.
 *
 * @param {number} timestamp – Unix timestamp in milliseconds
 * @param {Object} [opts]
 * @param {number} [opts.size=128]        – Icon's outer width/height (square)
 * @param {number} [opts.padding=0]       – Padding around the icon
 * @param {string} [opts.header="#EF5350"] – Month‑bar fill color
 * @param {string} [opts.stroke="#0B0B0B"] – Outline / text stroke color
 * @returns {string} SVG string
 */
function createCalendarClockSVG(timestamp = Date.now(), opts = {}) {
    const d = new Date(timestamp);
    const {
        size = 128,
        padding = 0,
        header = "#EF5350",
        stroke = "#0B0B0B"
    } = opts;

    // ---------- basic geometry ----------
    const s = size;
    const p = padding;
    const strokeW = s * 0.05;           // thick outline
    const borderRadius = s * 0.1;      // corner radius
    const headerH = s * 0.28;          // header height
    
    // Clock dimensions and positioning (positioned as overlay in bottom-right, overlapping the corner)
    const clockRadius = s * 0.18;      // larger clock
    const clockOverlap = clockRadius * 0.4; // how much the clock extends beyond the calendar
    const clockCX = s - strokeW / 2 - clockOverlap;  // right edge with overlap
    const clockCY = s - strokeW / 2 - clockOverlap;  // bottom edge with overlap

    // ---------- date / time parts ----------
    const monthTxt = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const dayTxt = d.getUTCDate().toString();
    const hours = d.getUTCHours();
    const mins = d.getUTCMinutes();

    // angles for hands (0° at 12 o'clock, clockwise)
    const minDeg = mins * 6;                                     // 360 / 60
    const hrDeg = ((hours % 12) + mins / 60) * 30;              // 360 / 12

    // helper to turn polar angle (deg) + length into cartesian end‑point
    const polar = (deg, len) => {
        const rad = (deg - 90) * Math.PI / 180;  // SVG 0° = 3 o'clock; shift to 12
        return [clockCX + len * Math.cos(rad), clockCY + len * Math.sin(rad)];
    };

    const [minX, minY] = polar(minDeg, clockRadius * 0.75);
    const [hrX, hrY] = polar(hrDeg, clockRadius * 0.5);

    // ---------- svg string builder ----------
    const totalSize = s + (p * 2); // Add padding to both sides
    const svg = `<svg width="${s}" height="${s}" viewBox="0 0 ${totalSize} ${totalSize}" fill="none" xmlns="http://www.w3.org/2000/svg">

    <!-- Calendar main background with rounded corners -->
    <rect x="${p + strokeW / 2}" y="${p + strokeW / 2}" width="${s - strokeW}" height="${s - strokeW}" rx="${borderRadius}" stroke="${stroke}" stroke-width="${strokeW}" fill="#FFFFFF"/>

    <!-- Header bar with rounded top corners only (rendered last to be on top) -->
    <path d="M ${p + strokeW / 2 + borderRadius} ${p + strokeW / 2}
             L ${p + s - strokeW / 2 - borderRadius} ${p + strokeW / 2}
             A ${borderRadius} ${borderRadius} 0 0 1 ${p + s - strokeW / 2} ${p + strokeW / 2 + borderRadius}
             L ${p + s - strokeW / 2} ${p + headerH}
             L ${p + strokeW / 2} ${p + headerH}
             L ${p + strokeW / 2} ${p + strokeW / 2 + borderRadius}
             A ${borderRadius} ${borderRadius} 0 0 1 ${p + strokeW / 2 + borderRadius} ${p + strokeW / 2} Z" 
          fill="${header}"/>
    
    <!-- Month text (rendered last to be on top) -->
    <text x="${p + s / 2}" y="${p + headerH * 0.65}" font-family="Arial, sans-serif" font-size="${headerH * 0.60}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF">${monthTxt}</text>

    <!-- Calendar main body with rounded corners -->
    <rect x="${p + strokeW / 2}" y="${p + strokeW / 2}" width="${s - strokeW}" height="${s - strokeW}" rx="${borderRadius}" stroke="${stroke}" stroke-width="${strokeW}" fill="none"/>
    
    <!-- Day number -->
    <text x="${p + s / 2}" y="${p + headerH + (s - headerH) * 0.45}" font-family="Arial, sans-serif" font-size="${(s - headerH) * 0.6}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="${stroke}">${dayTxt}</text>
    
    <!-- Clock background circle -->
    <circle cx="${p + clockCX}" cy="${p + clockCY}" r="${clockRadius}" stroke="${stroke}" stroke-width="${strokeW * 0.8}" fill="#FFFFFF"/>
    
    <!-- Clock hour markers (12, 3, 6, 9 positions) -->
    <circle cx="${p + clockCX}" cy="${p + clockCY - clockRadius * 0.7}" r="${strokeW * 0.25}" fill="${stroke}"/>
    <circle cx="${p + clockCX + clockRadius * 0.7}" cy="${p + clockCY}" r="${strokeW * 0.25}" fill="${stroke}"/>
    <circle cx="${p + clockCX}" cy="${p + clockCY + clockRadius * 0.7}" r="${strokeW * 0.25}" fill="${stroke}"/>
    <circle cx="${p + clockCX - clockRadius * 0.7}" cy="${p + clockCY}" r="${strokeW * 0.25}" fill="${stroke}"/>
    
    <!-- Minute hand -->
    <line x1="${p + clockCX}" y1="${p + clockCY}" x2="${p + minX}" y2="${p + minY}" stroke="${stroke}" stroke-width="${strokeW * 0.4}" stroke-linecap="round"/>
    
    <!-- Hour hand (thicker and shorter) -->
    <line x1="${p + clockCX}" y1="${p + clockCY}" x2="${p + hrX}" y2="${p + hrY}" stroke="${stroke}" stroke-width="${strokeW * 0.6}" stroke-linecap="round"/>
    
    <!-- Center pin -->
    <circle cx="${p + clockCX}" cy="${p + clockCY}" r="${strokeW * 0.4}" fill="${stroke}"/>
</svg>`;

    return svg;
} 