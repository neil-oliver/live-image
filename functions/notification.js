const { normalizeColor } = require('./shared-utils');

const BELL_PATH = 'M9.75 0C10.233 0 10.7763 0.08296 11.2214 0.37434C11.7152 0.69759 12 1.22083 12 1.875C12 2.33918 11.8588 2.81938 11.6289 3.23431C14.7814 4.03651 17.1622 6.81135 17.3406 10.2016C17.3497 10.3741 17.3564 10.5393 17.3629 10.6985C17.3851 11.24 17.4044 11.7115 17.5025 12.1633C17.6198 12.7031 17.8367 13.1275 18.2779 13.4584C19.0472 14.0354 19.5 14.941 19.5 15.9027C19.5 17.284 18.4128 18.5 16.95 18.5H13.425C13.0775 20.2117 11.5642 21.5 9.75 21.5C7.9358 21.5 6.42247 20.2117 6.07501 18.5H2.55C1.08719 18.5 0 17.284 0 15.9027C0 15.0097 0.390407 14.1651 1.06216 13.587L1.22213 13.4584C1.66329 13.1275 1.88025 12.7031 1.99749 12.1633C2.07599 11.8019 2.10403 11.4278 2.12345 11.0154L2.13705 10.6985C2.14356 10.5393 2.15032 10.3741 2.1594 10.2016C2.33784 6.81135 4.71857 4.03651 7.8711 3.23431C7.64125 2.81938 7.5 2.33918 7.5 1.875C7.5 1.22083 7.7848 0.69759 8.2786 0.37434C8.7237 0.08296 9.267 0 9.75 0ZM11.872 18.5H7.62803C7.9369 19.3739 8.7703 20 9.75 20C10.7297 20 11.5631 19.3739 11.872 18.5ZM9.75 4.5C6.50507 4.5 3.82788 7.03999 3.65733 10.2804C3.65061 10.4082 3.64525 10.5435 3.63968 10.6842C3.61752 11.2442 3.59199 11.8891 3.46332 12.4816C3.29263 13.2676 2.9282 14.0539 2.12213 14.6584C1.73049 14.9521 1.5 15.4131 1.5 15.9027C1.5 16.5177 1.97641 17 2.55 17H16.95C17.5236 17 18 16.5177 18 15.9027C18 15.4131 17.7695 14.9521 17.3779 14.6584C16.5718 14.0539 16.2074 13.2676 16.0367 12.4816C15.9337 12.0076 15.8968 11.5001 15.8748 11.0293L15.8603 10.6841C15.8547 10.5433 15.8494 10.4081 15.8427 10.2804C15.6721 7.03999 12.9949 4.5 9.75 4.5ZM9.75 1.5C9.4046 1.5 9.1979 1.56533 9.1001 1.62934C9.0598 1.65574 9.0423 1.67864 9.0316 1.69888C9.0204 1.72026 9 1.77106 9 1.875C9 2.10726 9.1028 2.42217 9.2913 2.67575C9.4853 2.93683 9.6631 3 9.75 3C9.8369 3 10.0147 2.93683 10.2087 2.67575C10.3972 2.42217 10.5 2.10726 10.5 1.875C10.5 1.77106 10.4796 1.72026 10.4684 1.69888C10.4577 1.67864 10.4402 1.65574 10.3999 1.62934C10.3021 1.56533 10.0954 1.5 9.75 1.5Z';

// Composite layout constants (28x28 square viewBox)
const VB = 28;
const BELL_X = 0.5;
const BELL_Y = 6;
const BELL_W = 20;
const BELL_H = 22;
const BADGE_CX = 19.5;
const BADGE_CY = 8.75;
const BADGE_R = 7.75;
const BADGE_STROKE = '#091A15';
const BADGE_STROKE_W = 1.5;

const notificationHandler = async (event, context) => {
    const queryParams = event.queryStringParameters || {};

    const count = Math.max(0, parseInt(queryParams.count) || 0);
    const size = parseInt(queryParams.size) || 64;
    const bellColor = normalizeColor(queryParams.bellColor || '#E6E6E6');
    const badgeColor = normalizeColor(queryParams.badgeColor || '#FF4242');
    const textColor = normalizeColor(queryParams.textColor || '#E6E6E6');

    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(bellColor) || !colorRegex.test(badgeColor) || !colorRegex.test(textColor)) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid color format. Use hex color (e.g., #3B82F6)' }),
        };
    }

    if (size < 16 || size > 512) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Size must be between 16 and 512 pixels' }),
        };
    }

    const countStr = String(count);
    const fontSize = countStr.length <= 1 ? 10 : countStr.length === 2 ? 8 : 6;

    const svgImage = `<svg width="${size}" height="${size}" viewBox="0 0 ${VB} ${VB}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <svg x="${BELL_X}" y="${BELL_Y}" width="${BELL_W}" height="${BELL_H}" viewBox="0 0 20 22">
    <path fill-rule="evenodd" clip-rule="evenodd" d="${BELL_PATH}" fill="${bellColor}"/>
  </svg>
  <circle cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" fill="${badgeColor}"/>
  <circle cx="${BADGE_CX}" cy="${BADGE_CY}" r="${BADGE_R}" stroke="${BADGE_STROKE}" stroke-width="${BADGE_STROKE_W}" fill="none"/>
  <text x="${BADGE_CX}" y="${BADGE_CY}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-family="Arial, sans-serif" font-weight="600" fill="${textColor}">${countStr}</text>
</svg>`;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=2592000',
            'Access-Control-Allow-Origin': '*'
        },
        body: svgImage.trim(),
    };
};

exports.handler = notificationHandler;
