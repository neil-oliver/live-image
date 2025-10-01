import type { EndpointConfig } from '@/types';

// Build URL with query parameters
export function buildImageUrl(
  endpoint: EndpointConfig,
  parameters: Record<string, any>,
  baseUrl: string = ''
): string {
  const url = new URL(endpoint.path, baseUrl || window.location.origin);
  
  // Add all non-empty parameters to query string
  Object.entries(parameters).forEach(([key, value]) => {
    // Skip empty values (but allow 0 and false)
    if (value === '' || value === null || value === undefined) {
      return;
    }
    
    // Convert to string
    const stringValue = String(value);
    
    // Add to URL
    url.searchParams.set(key, stringValue);
  });
  
  return url.toString();
}

// Validate parameter value based on its configuration
export function validateParameter(
  value: any,
  paramConfig: { type: string; min?: number; max?: number; required?: boolean }
): boolean {
  if (paramConfig.required && (value === '' || value === null || value === undefined)) {
    return false;
  }
  
  if (paramConfig.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return false;
    if (paramConfig.min !== undefined && num < paramConfig.min) return false;
    if (paramConfig.max !== undefined && num > paramConfig.max) return false;
  }
  
  return true;
}

// Parse color string (handles hex colors)
export function parseColor(color: string): string {
  if (!color) return '';
  
  // Remove leading # if present, then add it back
  const cleaned = color.replace(/^#/, '');
  
  // Validate hex color
  if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  
  return color;
}

// Parse multi-color string (comma-separated)
export function parseMultiColor(colors: string): string[] {
  if (!colors) return [];
  
  return colors
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0)
    .map(parseColor);
}

