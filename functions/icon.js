// Helper function to convert Lucide icon array to SVG string
function iconToSvg(iconData, options = {}) {
    const {
        color = 'currentColor',
        size = 24,
        strokeWidth = 2,
        fill = 'none',
        strokeLinecap = 'round',
        strokeLinejoin = 'round'
    } = options;

    // Convert icon data array to SVG path elements
    const paths = iconData.map(([tag, attrs]) => {
        if (tag === 'path') {
            const attrString = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            return `<${tag} ${attrString} />`;
        }
        return '';
    }).join('\n    ');

    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="${strokeLinecap}" stroke-linejoin="${strokeLinejoin}" xmlns="http://www.w3.org/2000/svg">
    ${paths}
</svg>`;
}

exports.handler = async (event, context) => {
    const query = event.queryStringParameters || {};

    // Parameters
    const nameRaw = query.name || query.icon || query.iconName || '';
    const searchQueryRaw = query.search || '';
    const color = query.color || 'currentColor';
    const size = Math.max(8, Math.min(1024, parseInt(query.size) || 24));
    const strokeWidth = Math.max(0.25, Math.min(8, parseFloat(query.strokeWidth) || 2));
    const padding = Math.max(0, Math.min(200, parseInt(query.padding) || 10));

    // If searching, either return JSON list (with list=true) or best match icon (default)
    if (searchQueryRaw) {
        try {
            const lucide = require('lucide');
            const q = String(searchQueryRaw).toLowerCase().trim();
            const limit = Math.max(1, Math.min(200, parseInt(query.limit) || 50));
            const returnList = query.list !== undefined; // Check if 'list' parameter is present

            // Convert PascalCase to kebab-case for consistent naming
            const toKebabCase = (str) => {
                return str
                    // Handle consecutive uppercase letters (e.g., AArrowDown -> A-Arrow-Down)
                    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
                    // Handle lowercase followed by uppercase (e.g., arrowDown -> arrow-Down)
                    .replace(/([a-z])([A-Z])/g, '$1-$2')
                    .toLowerCase();
            };

            const matchingIcons = Object.keys(lucide)
                .filter((n) => n.toLowerCase().includes(q) && Array.isArray(lucide[n]))
                .slice(0, limit);

            if (matchingIcons.length === 0) {
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: `No icons found matching: ${q}`, 
                        query: q,
                        results: []
                    })
                };
            }

            const results = matchingIcons.map(name => toKebabCase(name));

            // If list parameter is present, return JSON list
            if (returnList) {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=300'
                    },
                    body: JSON.stringify({ query: q, count: results.length, results })
                };
            }

            // Otherwise, return the best match (first result) as SVG
            const bestMatchName = matchingIcons[0];
            const iconData = lucide[bestMatchName];
            
            // Build SVG for the best match
            const innerSvg = iconToSvg(iconData, { color, size, strokeWidth });

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

    // Convert kebab-case to PascalCase for Lucide internal naming
    const toPascalCase = (str) => {
        return str
            .split('-')
            .map(word => {
                // Handle single letters (like 'a' in 'a-arrow-down')
                if (word.length === 1) {
                    return word.toUpperCase();
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
    };

    // Normalize input name (accept spaces/underscores/camelCase -> kebab-case -> PascalCase)
    const kebabName = String(nameRaw)
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
        .trim();
    
    const pascalName = toPascalCase(kebabName);

    try {
        const lucide = require('lucide');

        // Try multiple name variations to find the icon
        const namesToTry = [
            pascalName,        // AArrowDown
            kebabName,         // a-arrow-down
            nameRaw,           // original input
            nameRaw.toLowerCase(),
            nameRaw.toUpperCase()
        ];
        
        let iconData = null;
        for (const name of namesToTry) {
            if (lucide[name]) {
                iconData = lucide[name];
                break;
            }
        }
        
        // If still not found, try case-insensitive search
        if (!iconData) {
            const key = Object.keys(lucide).find((k) => k.toLowerCase() === kebabName.toLowerCase());
            if (key) iconData = lucide[key];
        }

        if (!iconData || !Array.isArray(iconData)) {
            // Convert PascalCase to kebab-case for suggestions
            const toKebabCase = (str) => {
                return str
                    // Handle consecutive uppercase letters (e.g., AArrowDown -> A-Arrow-Down)
                    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
                    // Handle lowercase followed by uppercase (e.g., arrowDown -> arrow-Down)
                    .replace(/([a-z])([A-Z])/g, '$1-$2')
                    .toLowerCase();
            };
            
            // Provide suggestions - both exact matches and similar names
            const searchTerms = [kebabName, nameRaw.toLowerCase()];
            const suggestionSet = new Set();
            
            // Add exact partial matches
            searchTerms.forEach(term => {
                Object.keys(lucide)
                    .filter(k => k.toLowerCase().includes(term))
                    .slice(0, 5)
                    .forEach(name => suggestionSet.add(toKebabCase(name)));
            });
            
            // Add similar arrow icons if searching for arrow
            if (kebabName.includes('arrow')) {
                Object.keys(lucide)
                    .filter(k => k.toLowerCase().includes('arrow'))
                    .slice(0, 5)
                    .forEach(name => suggestionSet.add(toKebabCase(name)));
            }
            
            const suggestions = Array.from(suggestionSet).slice(0, 15);
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    error: `Icon not found: ${nameRaw} (tried: ${pascalName}, ${kebabName})`, 
                    suggestions 
                })
            };
        }

        // Build base icon SVG
        const innerSvg = iconToSvg(iconData, { color, size, strokeWidth });

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


