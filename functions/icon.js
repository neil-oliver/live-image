const fetch = require('node-fetch');

// Metadata cache for icon search enhancement
const metadataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to normalize color values
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

// Fetch icon metadata from Lucide repository
async function fetchIconMetadata(iconName) {
    const cacheKey = iconName.toLowerCase();
    const cached = metadataCache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    
    try {
        // Convert PascalCase to kebab-case for URL
        const kebabName = iconName
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
            
        const response = await fetch(`https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/${kebabName}.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const metadata = await response.json();
        
        // Cache the result
        metadataCache.set(cacheKey, {
            data: metadata,
            timestamp: Date.now()
        });
        
        return metadata;
    } catch (error) {
        // Cache null result to avoid repeated failed requests
        metadataCache.set(cacheKey, {
            data: null,
            timestamp: Date.now()
        });
        return null;
    }
}

// Calculate search relevance score for an icon
function calculateIconScore(iconName, query, metadata) {
    let score = 0;
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedName = iconName.toLowerCase();
    
    // Name matching (highest priority)
    if (normalizedName === normalizedQuery) {
        score += 100; // Exact match
    } else if (normalizedName.startsWith(normalizedQuery)) {
        score += 90; // Starts with query
    } else if (normalizedName.includes(normalizedQuery)) {
        score += 80; // Contains query
        // Bonus for shorter names (more relevant)
        score += Math.max(0, 10 - (normalizedName.length - normalizedQuery.length) / 2);
    }
    
    // Metadata-based scoring
    if (metadata) {
        // Tag matching
        if (metadata.tags) {
            for (const tag of metadata.tags) {
                const normalizedTag = tag.toLowerCase();
                if (normalizedTag === normalizedQuery) {
                    score += 70; // Exact tag match
                } else if (normalizedTag.startsWith(normalizedQuery)) {
                    score += 60; // Tag starts with query
                } else if (normalizedTag.includes(normalizedQuery)) {
                    score += 50; // Tag contains query
                }
            }
        }
        
        // Category matching
        if (metadata.categories) {
            for (const category of metadata.categories) {
                const normalizedCategory = category.toLowerCase();
                if (normalizedCategory === normalizedQuery) {
                    score += 40; // Exact category match
                } else if (normalizedCategory.includes(normalizedQuery)) {
                    score += 30; // Category contains query
                }
            }
        }
        
        // Alias matching
        if (metadata.aliases) {
            for (const alias of metadata.aliases) {
                const normalizedAlias = alias.name.toLowerCase();
                if (normalizedAlias === normalizedQuery) {
                    score += 95; // Exact alias match (slightly less than name)
                } else if (normalizedAlias.includes(normalizedQuery)) {
                    score += 75; // Alias contains query
                }
            }
        }
    }
    
    // Multi-word query bonus
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    if (queryWords.length > 1) {
        let matchedWords = 0;
        for (const word of queryWords) {
            if (normalizedName.includes(word) || 
                (metadata?.tags?.some(tag => tag.toLowerCase().includes(word))) ||
                (metadata?.categories?.some(cat => cat.toLowerCase().includes(word)))) {
                matchedWords++;
            }
        }
        score += (matchedWords - 1) * 10; // Bonus for additional matched words
    }
    
    return score;
}

// Parse advanced search queries
function parseSearchQuery(query) {
    const normalizedQuery = query.toLowerCase().trim();
    let searchTerms = normalizedQuery;
    let categoryFilter = null;
    
    // Extract category filter: "category:communication phone"
    const categoryMatch = normalizedQuery.match(/category:(\w+)/);
    if (categoryMatch) {
        categoryFilter = categoryMatch[1];
        searchTerms = normalizedQuery.replace(/category:\w+\s*/, '').trim();
    }
    
    return {
        searchTerms,
        categoryFilter,
        originalQuery: query
    };
}

// Enhanced icon search with metadata
async function searchIconsWithMetadata(query, limit = 50) {
    const lucide = require('lucide');
    const parsedQuery = parseSearchQuery(query);
    const iconNames = Object.keys(lucide).filter(k => Array.isArray(lucide[k]));
    
    // Process icons in parallel for better performance
    const iconPromises = iconNames.map(async (iconName) => {
        const metadata = await fetchIconMetadata(iconName);
        
        // Apply category filter if specified
        if (parsedQuery.categoryFilter && metadata?.categories) {
            const hasCategory = metadata.categories.some(cat => 
                cat.toLowerCase().includes(parsedQuery.categoryFilter)
            );
            if (!hasCategory) {
                return null; // Skip this icon
            }
        }
        
        const score = calculateIconScore(iconName, parsedQuery.searchTerms, metadata);
        
        return score > 0 ? {
            name: iconName,
            score,
            metadata: metadata || {}
        } : null;
    });
    
    // Wait for all metadata fetches to complete
    const results = await Promise.all(iconPromises);
    
    // Filter out null results and sort by score
    return results
        .filter(result => result !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

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
    const color = normalizeColor(query.color || 'currentColor');
    const size = Math.max(8, Math.min(1024, parseInt(query.size) || 24));
    const strokeWidth = Math.max(0.25, Math.min(8, parseFloat(query.strokeWidth) || 2));
    const padding = Math.max(0, Math.min(200, parseInt(query.padding) || 10));

    // Enhanced search with metadata support
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

            // Use enhanced search with metadata
            const searchResults = await searchIconsWithMetadata(q, limit);

            if (searchResults.length === 0) {
                // Enhanced fallback: suggest by category or provide semantic suggestions
                const parsedQuery = parseSearchQuery(q);
                const suggestions = [];
                
                // Try category suggestions
                const categoryKeywords = {
                    'love': 'heart',
                    'call': 'phone', 
                    'telephone': 'phone',
                    'email': 'mail',
                    'search': 'search',
                    'find': 'search',
                    'communication': ['phone', 'mail', 'message'],
                    'arrows': ['arrow-up', 'arrow-down', 'arrow-left', 'arrow-right'],
                    'social': ['heart', 'share', 'thumbs-up']
                };
                
                for (const [keyword, suggestion] of Object.entries(categoryKeywords)) {
                    if (parsedQuery.searchTerms.includes(keyword)) {
                        if (Array.isArray(suggestion)) {
                            suggestions.push(...suggestion);
                        } else {
                            suggestions.push(suggestion);
                        }
                    }
                }
                
                return {
                    statusCode: 404,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        error: `No icons found matching: ${q}`, 
                        query: q,
                        suggestions: suggestions.slice(0, 5),
                        tip: 'Try using category filters like "category:communication phone" or semantic terms like "love" for heart',
                        results: []
                    })
                };
            }

            const results = searchResults.map(result => ({
                name: toKebabCase(result.name),
                score: result.score,
                categories: result.metadata.categories || [],
                tags: result.metadata.tags || []
            }));

            // If list parameter is present, return enhanced JSON list with metadata
            if (returnList) {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=300'
                    },
                    body: JSON.stringify({ 
                        query: q, 
                        count: results.length, 
                        results: results.map(r => r.name),
                        enhanced_results: results // Include metadata for advanced clients
                    })
                };
            }

            // Otherwise, return the best match (highest scoring result) as SVG
            const bestMatch = searchResults[0];
            const iconData = lucide[bestMatch.name];
            
            // Build SVG for the best match
            const innerSvg = iconToSvg(iconData, { color, size, strokeWidth });

            // If no padding requested, return icon as-is
            if (!padding) {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'image/svg+xml',
                        'Cache-Control': 'public, max-age=300',
                        'Access-Control-Allow-Origin': '*',
                        'X-Icon-Name': bestMatch.name,
                        'X-Match-Score': bestMatch.score.toString(),
                        'X-Categories': (bestMatch.metadata.categories || []).join(','),
                        'X-Tags': (bestMatch.metadata.tags || []).join(',')
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
                    'Access-Control-Allow-Origin': '*',
                    'X-Icon-Name': bestMatch.name,
                    'X-Match-Score': bestMatch.score.toString(),
                    'X-Categories': (bestMatch.metadata.categories || []).join(','),
                    'X-Tags': (bestMatch.metadata.tags || []).join(',')
                },
                body: wrapped
            };
        } catch (err) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Enhanced search failed', details: err.message })
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


