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

            // Convert PascalCase to kebab-case for consistent naming
            const toKebabCase = (str) => {
                return str
                    // Handle consecutive uppercase letters (e.g., AArrowDown -> A-Arrow-Down)
                    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
                    // Handle lowercase followed by uppercase (e.g., arrowDown -> arrow-Down)
                    .replace(/([a-z])([A-Z])/g, '$1-$2')
                    .toLowerCase();
            };

            const results = Object.keys(icons)
                .filter((n) => n.toLowerCase().includes(q))
                .slice(0, limit)
                .map(name => toKebabCase(name));

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
        const mod = await import('lucide');
        const icons = mod.icons || {};

        // Try multiple name variations to find the icon
        const namesToTry = [
            pascalName,        // AArrowDown
            kebabName,         // a-arrow-down
            nameRaw,           // original input
            nameRaw.toLowerCase(),
            nameRaw.toUpperCase()
        ];
        
        let iconDef = null;
        for (const name of namesToTry) {
            if (icons[name]) {
                iconDef = icons[name];
                break;
            }
        }
        
        // If still not found, try case-insensitive search
        if (!iconDef) {
            const key = Object.keys(icons).find((k) => k.toLowerCase() === kebabName.toLowerCase());
            if (key) iconDef = icons[key];
        }

        if (!iconDef || typeof iconDef.toSvg !== 'function') {
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
                Object.keys(icons)
                    .filter(k => k.toLowerCase().includes(term))
                    .slice(0, 5)
                    .forEach(name => suggestionSet.add(toKebabCase(name)));
            });
            
            // Add similar arrow icons if searching for arrow
            if (kebabName.includes('arrow')) {
                Object.keys(icons)
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


