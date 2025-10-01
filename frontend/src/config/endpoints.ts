import type { EndpointConfig } from '@/types';

// Central configuration for all endpoints
// This is the single source of truth - add/modify parameters here and the UI updates automatically
export const endpoints: EndpointConfig[] = [
  {
    id: 'blur',
    name: 'Blur Background',
    description: 'Create blurred abstract backgrounds with overlapping gradients',
    path: '/blur.svg',
    category: 'graphics',
    parameters: [
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        default: 1200,
        min: 1,
        max: 3000,
        description: 'Image width in pixels'
      },
      {
        name: 'height',
        label: 'Height',
        type: 'number',
        default: 800,
        min: 1,
        max: 3000,
        description: 'Image height in pixels'
      },
      {
        name: 'colors',
        label: 'Colors',
        type: 'multiColor',
        default: '#FF7A59,#FFD166,#7BDFF2,#B794F4,#6EE7B7',
        description: 'Comma-separated hex colors for the gradient palette'
      },
      {
        name: 'num',
        label: 'Number of Blobs',
        type: 'number',
        default: 8,
        min: 2,
        max: 24,
        description: 'Number of overlapping gradient shapes'
      },
      {
        name: 'blur',
        label: 'Blur Amount',
        type: 'number',
        default: 0,
        min: 0,
        max: 500,
        description: 'Blur intensity (0 = auto-calculated)'
      },
      {
        name: 'opacity',
        label: 'Opacity',
        type: 'number',
        default: 0.85,
        min: 0.05,
        max: 1,
        step: 0.05,
        description: 'Opacity of each blob'
      },
      {
        name: 'bg',
        label: 'Background',
        type: 'color',
        default: '#EEF2FF',
        description: 'Background color (or "transparent")'
      },
      {
        name: 'seed',
        label: 'Seed',
        type: 'text',
        default: '',
        placeholder: 'Random seed...',
        description: 'Seed for deterministic generation'
      }
    ],
    examples: [
      { name: 'Sunset', colors: '#FF6B6B,#FFA07A,#FFD93D,#6BCB77', num: 10, opacity: 0.7 },
      { name: 'Ocean', colors: '#667EEA,#764BA2,#00F5FF,#7BDFF2', num: 12, blur: 100 },
      { name: 'Forest', colors: '#11998E,#38EF7D,#90EE90,#228B22', bg: 'transparent' }
    ]
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Generate linear gradients with custom colors and directions',
    path: '/gradient.svg',
    category: 'graphics',
    parameters: [
      {
        name: 'colors',
        label: 'Colors',
        type: 'multiColor',
        default: '#3B82F6',
        description: 'Comma-separated colors for gradient'
      },
      {
        name: 'direction',
        label: 'Direction',
        type: 'select',
        default: 'to right',
        options: [
          { value: 'to right', label: 'To Right' },
          { value: 'to left', label: 'To Left' },
          { value: 'to bottom', label: 'To Bottom' },
          { value: 'to top', label: 'To Top' },
          { value: 'to bottom right', label: 'To Bottom Right' },
          { value: 'to bottom left', label: 'To Bottom Left' },
          { value: 'to top right', label: 'To Top Right' },
          { value: 'to top left', label: 'To Top Left' },
          { value: '45deg', label: '45 Degrees' },
          { value: '90deg', label: '90 Degrees' },
          { value: '135deg', label: '135 Degrees' }
        ],
        description: 'Gradient direction'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'number',
        default: 500,
        min: 1,
        max: 2000,
        description: 'Image width'
      },
      {
        name: 'height',
        label: 'Height',
        type: 'number',
        default: 300,
        min: 1,
        max: 2000,
        description: 'Image height'
      }
    ],
    examples: [
      { name: 'Blue to Purple', colors: '#3B82F6,#8B5CF6', direction: 'to right' },
      { name: 'Sunset', colors: '#FF6B6B,#FFA07A,#FFD93D', direction: 'to bottom' },
      { name: 'Rainbow', colors: '#FF0000,#FF7F00,#FFFF00,#00FF00,#0000FF,#4B0082,#9400D3', direction: '45deg' }
    ]
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    description: 'Horizontal progress bars with gradients',
    path: '/progress-bar.svg',
    category: 'ui',
    parameters: [
      {
        name: 'value',
        label: 'Progress Value',
        type: 'number',
        default: 50,
        min: 0,
        max: 100,
        description: 'Progress percentage (0-100)'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'multiColor',
        default: '#3B82F6',
        description: 'Progress bar color(s) - comma-separated for gradient'
      },
      {
        name: 'bg',
        label: 'Background Color',
        type: 'color',
        default: '#E5E7EB',
        description: 'Background track color'
      },
      {
        name: 'aspectRatio',
        label: 'Aspect Ratio',
        type: 'number',
        default: 4,
        min: 1,
        max: 10,
        step: 0.5,
        description: 'Width to height ratio'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 20,
        min: 0,
        max: 100,
        description: 'Padding around the bar'
      },
      {
        name: 'radius',
        label: 'Corner Radius',
        type: 'number',
        default: '',
        placeholder: 'Auto (fully rounded)',
        min: 0,
        max: 100,
        description: 'Corner radius in pixels (empty = auto)'
      },
      {
        name: 'gradientSpan',
        label: 'Gradient Span',
        type: 'select',
        default: 'bar',
        options: [
          { value: 'bar', label: 'Full Bar' },
          { value: 'progress', label: 'Progress Only' }
        ],
        description: 'How gradient spans across the bar'
      }
    ],
    examples: [
      { name: '75% Complete', value: 75, color: '#10B981' },
      { name: 'Gradient', value: 60, color: '#3B82F6,#8B5CF6,#EC4899' },
      { name: 'Warning', value: 30, color: '#F59E0B', bg: '#FEF3C7' }
    ]
  },
  {
    id: 'progress-donut',
    name: 'Progress Donut',
    description: 'Circular progress indicators',
    path: '/progress-donut.svg',
    category: 'ui',
    parameters: [
      {
        name: 'value',
        label: 'Progress Value',
        type: 'number',
        default: 50,
        min: 0,
        max: 100,
        description: 'Progress percentage (0-100)'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'multiColor',
        default: '#3B82F6',
        description: 'Progress color(s) - comma-separated for gradient'
      },
      {
        name: 'bg',
        label: 'Background Color',
        type: 'color',
        default: '#E5E7EB',
        description: 'Background ring color'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'number',
        default: 200,
        min: 50,
        max: 500,
        description: 'Donut diameter in pixels'
      },
      {
        name: 'strokeWidth',
        label: 'Stroke Width',
        type: 'number',
        default: 20,
        min: 5,
        max: 50,
        description: 'Ring thickness'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 10,
        min: 0,
        max: 100,
        description: 'Padding around the donut'
      },
      {
        name: 'gradientSpan',
        label: 'Gradient Span',
        type: 'select',
        default: 'bar',
        options: [
          { value: 'bar', label: 'Full Circle' },
          { value: 'progress', label: 'Progress Only' }
        ],
        description: 'How gradient spans the circle'
      }
    ],
    examples: [
      { name: '100% Complete', value: 100, color: '#10B981' },
      { name: 'Half Way', value: 50, color: '#3B82F6,#8B5CF6' },
      { name: 'Low Progress', value: 15, color: '#EF4444', strokeWidth: 30 }
    ]
  },
  {
    id: 'badge',
    name: 'Badge',
    description: 'Generate pill-shaped badges with text and icons',
    path: '/badge.svg',
    category: 'ui',
    parameters: [
      {
        name: 'text',
        label: 'Text',
        type: 'text',
        default: '',
        placeholder: 'Badge text (optional)',
        description: 'Badge text content (leave empty for icon-only badge)'
      },
      {
        name: 'color',
        label: 'Text Color',
        type: 'color',
        default: '#3B82F6',
        description: 'Text and icon color'
      },
      {
        name: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        default: '',
        placeholder: 'Auto (lighter shade)',
        description: 'Background color (auto-generated if empty)'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 8,
        min: 0,
        max: 200,
        description: 'Horizontal padding'
      },
      {
        name: 'verticalPadding',
        label: 'Vertical Padding',
        type: 'number',
        default: 6,
        min: 0,
        max: 100,
        description: 'Vertical padding'
      },
      {
        name: 'radius',
        label: 'Corner Radius',
        type: 'number',
        default: '',
        placeholder: 'Auto (fully rounded)',
        min: 0,
        max: 100,
        description: 'Corner radius in pixels (empty = auto)'
      },
      {
        name: 'icon',
        label: 'Icon Name',
        type: 'text',
        default: '',
        placeholder: 'e.g., check, star, heart',
        description: 'Lucide icon name (optional)'
      },
      {
        name: 'iconPosition',
        label: 'Icon Position',
        type: 'select',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ],
        description: 'Icon position relative to text'
      },
      {
        name: 'iconSize',
        label: 'Icon Size',
        type: 'number',
        default: 16,
        min: 8,
        max: 32,
        description: 'Icon size in pixels'
      }
    ],
    examples: [
      { name: 'Success', text: 'Success', color: '#10B981', icon: 'check' },
      { name: 'Featured', text: 'Featured', color: '#F59E0B', icon: 'star', iconPosition: 'left' },
      { name: 'Icon Only', text: '', color: '#8B5CF6', icon: 'crown' }
    ]
  },
  {
    id: 'stars',
    name: 'Star Rating',
    description: 'Generate star rating graphics',
    path: '/stars.svg',
    category: 'ui',
    parameters: [
      {
        name: 'total',
        label: 'Total Stars',
        type: 'number',
        default: 5,
        min: 1,
        max: 10,
        description: 'Total number of stars'
      },
      {
        name: 'value',
        label: 'Rating Value',
        type: 'number',
        default: 0,
        min: 0,
        max: 10,
        step: 0.5,
        description: 'Filled stars (supports half stars)'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        default: '#FFD700',
        description: 'Star fill color'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'number',
        default: 200,
        min: 32,
        max: 512,
        description: 'Total width of rating'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 10,
        min: 0,
        max: 100,
        description: 'Padding around stars'
      }
    ],
    examples: [
      { name: '5 Stars', total: 5, value: 5, color: '#FFD700' },
      { name: '3.5 Stars', total: 5, value: 3.5, color: '#F59E0B' },
      { name: '4 of 5', total: 5, value: 4, color: '#EF4444' }
    ]
  },
  {
    id: 'datetime',
    name: 'Date Time',
    description: 'Calendar and clock icon with timestamp',
    path: '/datetime.svg',
    category: 'data',
    parameters: [
      {
        name: 'timestamp',
        label: 'Timestamp',
        type: 'timestamp',
        default: Date.now(),
        description: 'Unix timestamp (ms or seconds)'
      },
      {
        name: 'mode',
        label: 'Display Mode',
        type: 'select',
        default: 'datetime',
        options: [
          { value: 'datetime', label: 'Date & Time' },
          { value: 'date', label: 'Date Only' },
          { value: 'time', label: 'Time Only' }
        ],
        description: 'What to display'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'number',
        default: 128,
        min: 32,
        max: 512,
        description: 'Icon size in pixels'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 10,
        min: 0,
        max: 100,
        description: 'Padding around icon'
      },
      {
        name: 'header',
        label: 'Header Color',
        type: 'color',
        default: '#EF5350',
        description: 'Calendar header color'
      },
      {
        name: 'stroke',
        label: 'Stroke Color',
        type: 'color',
        default: '#0B0B0B',
        description: 'Outline and text color'
      }
    ],
    examples: [
      { name: 'Current Time', timestamp: Date.now(), mode: 'datetime' },
      { name: 'Date Only', timestamp: Date.now(), mode: 'date', header: '#3B82F6' },
      { name: 'Clock Only', timestamp: Date.now(), mode: 'time' }
    ]
  },
  {
    id: 'icon',
    name: 'Icon',
    description: 'Lucide icons with search and customization',
    path: '/icon.svg',
    category: 'ui',
    parameters: [
      {
        name: 'name',
        label: 'Icon Name',
        type: 'text',
        default: 'heart',
        description: 'Lucide icon name or search query'
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        default: '#000000',
        description: 'Icon color'
      },
      {
        name: 'size',
        label: 'Size',
        type: 'number',
        default: 24,
        min: 8,
        max: 1024,
        description: 'Icon size in pixels'
      },
      {
        name: 'strokeWidth',
        label: 'Stroke Width',
        type: 'number',
        default: 2,
        min: 0.25,
        max: 8,
        step: 0.25,
        description: 'Stroke width'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 10,
        min: 0,
        max: 200,
        description: 'Padding around icon'
      }
    ],
    examples: [
      { name: 'Heart Icon', iconName: 'heart', color: '#EF4444', size: 48 },
      { name: 'Star Icon', iconName: 'star', color: '#FFD700', strokeWidth: 3 },
      { name: 'Check Icon', iconName: 'check', color: '#10B981', size: 32 }
    ]
  },
  {
    id: 'user-card',
    name: 'User Card',
    description: 'User profile cards with avatar, name, and details',
    path: '/user-card.svg',
    category: 'social',
    parameters: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        default: 'User Name',
        description: 'Display name'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        default: '',
        placeholder: 'user@example.com',
        description: 'Email address'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'text',
        default: '',
        placeholder: 'Job title or description',
        description: 'Additional text (job title, etc.)'
      },
      {
        name: 'image',
        label: 'Avatar URL',
        type: 'url',
        default: '',
        placeholder: 'https://...',
        description: 'Profile image URL'
      },
      {
        name: 'ratio',
        label: 'Aspect Ratio',
        type: 'text',
        default: '5:1',
        placeholder: '16:9 or 4:3',
        description: 'Card aspect ratio (W:H)'
      },
      {
        name: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        default: '#3B82F6',
        description: 'Primary accent color'
      },
      {
        name: 'textColor',
        label: 'Text Color',
        type: 'color',
        default: '#1F2937',
        description: 'Main text color'
      },
      {
        name: 'subtextColor',
        label: 'Subtext Color',
        type: 'color',
        default: '#6B7280',
        description: 'Secondary text color'
      },
      {
        name: 'bgColor',
        label: 'Background',
        type: 'color',
        default: 'transparent',
        description: 'Card background color'
      },
      {
        name: 'padding',
        label: 'Padding',
        type: 'number',
        default: 10,
        min: 0,
        max: 100,
        description: 'Card padding'
      }
    ],
    examples: [
      { exampleName: 'Basic Card', name: 'John Doe', email: 'john@example.com', description: 'Software Engineer' },
      { exampleName: 'With Avatar', name: 'Jane Smith', email: 'jane@example.com', image: 'https://i.pravatar.cc/150?img=1' },
      { exampleName: 'Custom Colors', name: 'Alex Johnson', primaryColor: '#8B5CF6', bgColor: '#F3F4F6' }
    ]
  }
];

// Helper to get endpoint by ID
export const getEndpoint = (id: string): EndpointConfig | undefined => {
  return endpoints.find(e => e.id === id);
};

// Helper to get default parameters for an endpoint
export const getDefaultParameters = (endpointId: string): Record<string, any> => {
  const endpoint = getEndpoint(endpointId);
  if (!endpoint) return {};
  
  return endpoint.parameters.reduce((acc, param) => {
    acc[param.name] = param.default;
    return acc;
  }, {} as Record<string, any>);
};

