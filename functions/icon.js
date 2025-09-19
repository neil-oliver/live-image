exports.handler = async (event, context) => {
    const query = event.queryStringParameters || {};

    // Parameters
    const nameRaw = query.name || query.icon || query.iconName || '';
    const searchQueryRaw = query.search || '';
    const color = query.color || 'currentColor';
    const size = Math.max(8, Math.min(1024, parseInt(query.size) || 24));
    const strokeWidth = Math.max(0.25, Math.min(8, parseFloat(query.strokeWidth) || 2));
    const padding = Math.max(0, Math.min(200, parseInt(query.padding) || 10));

    // If searching, return JSON list of matching icon names
    if (searchQueryRaw) {
        try {
            const mod = await import('lucide');
            const icons = mod.icons || {};
            const q = String(searchQueryRaw).toLowerCase().trim();
            const limit = Math.max(1, Math.min(200, parseInt(query.limit) || 50));

            const results = Object.keys(icons)
                .filter((n) => n.toLowerCase().includes(q))
                .slice(0, limit);

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=300'
                },
                body: JSON.stringify({ query: q, count: results.length, results })
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Search failed', details: err.message })
            };
        }
    }

    // Validate name
    if (!nameRaw) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing icon name. Provide ?name=alert-triangle (or &search=...)' })
        };
    }

    // Normalize input name (accept spaces/underscores/camelCase -> kebab-case)
    const normalizedName = String(nameRaw)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
        .trim();

    try {
        const mod = await import('lucide');
        const icons = mod.icons || {};

        // Try exact, otherwise try case-insensitive fallback
        let iconDef = icons[normalizedName];
        if (!iconDef) {
            const key = Object.keys(icons).find((k) => k.toLowerCase() === normalizedName);
            if (key) iconDef = icons[key];
        }

        if (!iconDef || typeof iconDef.toSvg !== 'function') {
            // Provide a few suggestions
            const suggestions = Object.keys(icons)
                .filter((k) => k.includes(normalizedName))
                .slice(0, 10);
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: `Icon not found: ${normalizedName}`, suggestions })
            };
        }

        // Build base icon SVG
        const innerSvg = iconDef.toSvg({ color, size, strokeWidth });

        // If no padding requested, return icon as-is
        if (!padding) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'image/svg+xml',
                    'Cache-Control': 'public, max-age=300',
                    'Access-Control-Allow-Origin': '*'
                },
                body: innerSvg
            };
        }

        // Wrap icon in an outer canvas with configurable padding [[memory:3907943]]
        // Offset nested <svg> by adding x/y attributes.
        const injected = innerSvg.replace('<svg', `<svg x="${padding}" y="${padding}"`);
        const totalSize = size + padding * 2;
        const wrapped = `
<svg width="${totalSize}" height="${totalSize}" xmlns="http://www.w3.org/2000/svg">
  ${injected}
</svg>`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=300',
                'Access-Control-Allow-Origin': '*'
            },
            body: wrapped
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to render icon', details: error.message })
        };
    }
};


