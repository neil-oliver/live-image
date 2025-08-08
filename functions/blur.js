// Blurred random color background generator (SVG)
// Creates overlapping radial-gradient ellipses with soft edges. Deterministic with a seed.

// Simple seeded PRNG (mulberry32)
function createPRNG(seed) {
  let t = seed >>> 0;
  return function random() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function parseHexColorWithAlpha(hex) {
  // Supports #RGB, #RRGGBB, #RRGGBBAA, #RGBA
  const clean = hex.replace('#', '');
  let r, g, b, a = 1;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 4) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
    a = parseInt(clean[3] + clean[3], 16) / 255;
  } else if (clean.length === 6) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  } else if (clean.length === 8) {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
    a = parseInt(clean.substring(6, 8), 16) / 255;
  } else {
    return null;
  }
  return { r, g, b, a };
}

function toRgbString({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};

  // Dimensions
  const width = Math.max(1, Math.min(3000, parseInt(q.width) || 1200));
  const height = Math.max(1, Math.min(3000, parseInt(q.height) || 800));

  // Colors / palette
  const colorsParam = q.colors || '#FF7A59,#FFD166,#7BDFF2,#B794F4,#6EE7B7';
  const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;
  const palette = colorsParam
    .split(',')
    .map((c) => c.trim())
    .filter((c) => colorRegex.test(c));
  if (palette.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid colors provided' }) };
  }

  const num = Math.max(2, Math.min(24, parseInt(q.num) || 8));
  const seedStr = q.seed || `${colorsParam}-${width}x${height}-${num}`;
  const rand = createPRNG(hashStringToSeed(seedStr));

  // Background color (can be transparent)
  const bg = q.bg || '#EEF2FF';
  if (!(bg === 'transparent' || colorRegex.test(bg))) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid bg color. Use hex or "transparent"' }),
    };
  }

  // Global blur amount (applied to group). Use stdDeviation in user units.
  const blur = Math.max(0, Math.min(Math.round(Math.min(width, height) * 0.12), parseInt(q.blur) || Math.round(Math.min(width, height) * 0.08)));

  // Opacity of each blob (0..1)
  const opacity = Math.max(0.05, Math.min(1, q.opacity ? parseFloat(q.opacity) : 0.85));

  // Build gradients + ellipses
  const defs = [];
  const shapes = [];

  for (let i = 0; i < num; i++) {
    const colorHex = palette[Math.floor(rand() * palette.length)];
    const rgba = parseHexColorWithAlpha(colorHex);
    if (!rgba) continue;

    const id = `g${i}-${Math.floor(rand() * 1e9)}`;
    const stop0 = toRgbString(rgba);
    const stopOpacity = Math.max(0.35, Math.min(1, (rgba.a ?? 1) * opacity));

    defs.push(`
      <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${stop0}" stop-opacity="${stopOpacity}"/>
        <stop offset="100%" stop-color="${stop0}" stop-opacity="0"/>
      </radialGradient>
    `);

    // Random ellipse parameters
    const maxR = Math.min(width, height) * (0.25 + rand() * 0.35); // 25%..60% of min dim
    const rx = maxR * (0.6 + rand() * 0.8); // vary ellipse shape
    const ry = maxR * (0.5 + rand() * 0.9);
    const cx = -rx * 0.2 + rand() * (width + rx * 0.4); // allow bleed outside
    const cy = -ry * 0.2 + rand() * (height + ry * 0.4);
    const rotate = Math.round(rand() * 360);

    shapes.push(`
      <g transform="translate(${cx}, ${cy}) rotate(${rotate})">
        <ellipse cx="0" cy="0" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="url(#${id})" />
      </g>
    `);
  }

  const filterId = `blur-${Math.floor(rand() * 1e9)}`;

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="${filterId}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="${blur}" />
        </filter>
        ${defs.join('\n')}
      </defs>
      ${bg && bg !== 'transparent' ? `<rect width="${width}" height="${height}" fill="${bg}"/>` : ''}
      <g filter="url(#${filterId})">
        ${shapes.join('\n')}
      </g>
    </svg>
  `;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
    },
    body: svg,
  };
};


