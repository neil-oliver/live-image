exports.handler = async (event, context) => {
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    
    // Extract parameters with defaults
    const dateInput = queryParams.date || new Date().toISOString(); // Default to current date/time
    const size = parseInt(queryParams.size) || 128; // Default size
    const header = queryParams.header || "#EF5350"; // Default header color
    const stroke = queryParams.stroke || "#0B0B0B"; // Default stroke color
    
    // Validate size
    if (size < 32 || size > 512) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Size must be between 32 and 512 pixels' }),
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
        // Parse date input
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid date format. Use ISO string or timestamp' }),
            };
        }
        
        // Generate SVG
        const svg = createCalendarClockSVG(d, { size, header, stroke });
        
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
 * @param {Date|string|number} dateInput – Anything you can pass to new Date()
 * @param {Object} [opts]
 * @param {number} [opts.size=128]        – Icon's outer width/height (square)
 * @param {string} [opts.header="#EF5350"] – Month‑bar fill color
 * @param {string} [opts.stroke="#0B0B0B"] – Outline / text stroke color
 * @returns {string} SVG string
 */
function createCalendarClockSVG(dateInput = new Date(), opts = {}) {
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    const {
        size = 128,
        header = "#EF5350",
        stroke = "#0B0B0B"
    } = opts;

    // ---------- basic geometry ----------
    const s = size;
    const strokeW = s * 0.05;           // thick outline
    const headerH = s * 0.28;
    const radius = s * 0.17;           // clock radius
    // Position clock center at the bottom-right corner of the calendar
    const calendarRight = s - strokeW / 2;
    const calendarBottom = s - strokeW / 2;
    const clockCX = calendarRight + radius * 0.2;  // Clock center extends beyond calendar corner
    const clockCY = calendarBottom + radius * 0.2; // Clock center extends beyond calendar corner

    // ---------- date / time parts ----------
    const monthTxt = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const dayTxt = d.getDate().toString();
    const hours = d.getHours();
    const mins = d.getMinutes();

    // angles for hands (0° at 12 o'clock, clockwise)
    const minDeg = mins * 6;                                     // 360 / 60
    const hrDeg = ((hours % 12) + mins / 60) * 30;              // 360 / 12

    // helper to turn polar angle (deg) + length into cartesian end‑point
    const polar = (deg, len) => {
        const rad = (deg - 90) * Math.PI / 180;  // SVG 0° = 3 o'clock; shift to 12
        return [clockCX + len * Math.cos(rad), clockCY + len * Math.sin(rad)];
    };

    const [minX, minY] = polar(minDeg, radius * 0.9);
    const [hrX, hrY] = polar(hrDeg, radius * 0.6);

    // ---------- svg string builder ----------
    // Extend viewport to accommodate the clock that extends beyond calendar
    const extendedSize = s + radius * 0.6;
    const svg = `<svg width="${s}" height="${s}" viewBox="0 0 ${extendedSize} ${extendedSize}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Calendar outline -->
    <rect x="${strokeW / 2}" y="${strokeW / 2}" width="${s - strokeW}" height="${s - strokeW}" rx="${s * 0.1}" stroke="${stroke}" stroke-width="${strokeW}"/>
    
    <!-- Header bar -->
    <rect x="${strokeW / 2}" y="${strokeW / 2}" width="${s - strokeW}" height="${headerH}" fill="${header}"/>
    
    <!-- Month text -->
    <text x="${s / 2}" y="${headerH * 0.55}" font-family="sans-serif" font-size="${headerH * 0.3}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF">${monthTxt}</text>
    
    <!-- Day number -->
    <text x="${s / 2}" y="${headerH + (s - headerH) / 2}" font-family="sans-serif" font-size="${(s - headerH) * 0.55}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${stroke}">${dayTxt}</text>
    
    <!-- Clock outline -->
    <circle cx="${clockCX}" cy="${clockCY}" r="${radius}" stroke="${stroke}" stroke-width="${strokeW}" fill="#FFFFFF"/>
    
    <!-- Clock hour markers -->
    <circle cx="${clockCX}" cy="${clockCY - radius * 0.8}" r="${strokeW * 0.3}" fill="${stroke}"/>
    <circle cx="${clockCX + radius * 0.8}" cy="${clockCY}" r="${strokeW * 0.3}" fill="${stroke}"/>
    <circle cx="${clockCX}" cy="${clockCY + radius * 0.8}" r="${strokeW * 0.3}" fill="${stroke}"/>
    <circle cx="${clockCX - radius * 0.8}" cy="${clockCY}" r="${strokeW * 0.3}" fill="${stroke}"/>
    
    <!-- Minute hand -->
    <line x1="${clockCX}" y1="${clockCY}" x2="${minX}" y2="${minY}" stroke="${stroke}" stroke-width="${strokeW * 0.6}" stroke-linecap="round"/>
    
    <!-- Hour hand -->
    <line x1="${clockCX}" y1="${clockCY}" x2="${hrX}" y2="${hrY}" stroke="${stroke}" stroke-width="${strokeW * 0.8}" stroke-linecap="round"/>
    
    <!-- Center pin -->
    <circle cx="${clockCX}" cy="${clockCY}" r="${strokeW * 0.6}" fill="${stroke}"/>
</svg>`;

    return svg;
} 