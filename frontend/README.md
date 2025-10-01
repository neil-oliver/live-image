# Live Image Frontend

A modern, responsive web application for generating and customizing dynamic SVG images through various endpoints.

## 🎨 Features

- **9 Endpoint Types**: Blur backgrounds, gradients, progress bars, donuts, pills, stars, datetime, icons, and user cards
- **Dynamic Parameter Configuration**: All endpoints and their parameters are defined in a central config file
- **Live Preview**: Real-time image preview as you adjust parameters
- **Copy & Download**: Easily copy URLs or download generated images
- **Example Presets**: Quick-start examples for each endpoint
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Automatic dark mode support
- **Type-Safe**: Built with TypeScript for better developer experience

## 🏗️ Architecture

### Scalable Design

The application is built to be **highly scalable and responsive to changes**:

1. **Central Configuration** (`src/config/endpoints.ts`):
   - All endpoints and parameters are defined in one place
   - Add new endpoints or parameters without touching UI code
   - UI components automatically adapt to configuration changes

2. **Dynamic Form Generation**:
   - Parameter inputs are generated based on type definitions
   - Supports: number, text, color, multiColor, select, timestamp, url
   - Validation and constraints applied automatically

3. **State Management** (Zustand):
   - Lightweight, simple state management
   - Persists user preferences in localStorage
   - Separate parameter state for each endpoint

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   ├── EndpointEditor.tsx # Main editor with parameters & preview
│   │   ├── ParameterInput.tsx # Dynamic parameter input component
│   │   ├── ImagePreview.tsx   # Live image preview
│   │   ├── URLDisplay.tsx     # URL display with copy/download
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── config/
│   │   └── endpoints.ts       # ⭐ CENTRAL CONFIG - All endpoints defined here
│   ├── lib/
│   │   ├── store.ts           # Zustand state management
│   │   ├── url-builder.ts     # URL generation logic
│   │   └── utils.ts           # Utility functions
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles (Tailwind)
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Adding New Endpoints

To add a new endpoint, simply update `src/config/endpoints.ts`:

```typescript
{
  id: 'my-new-endpoint',
  name: 'My Endpoint',
  description: 'Description of what it does',
  path: '/my-endpoint.svg',
  category: 'graphics', // or 'ui', 'social', 'data'
  parameters: [
    {
      name: 'myParam',
      label: 'My Parameter',
      type: 'number', // or 'text', 'color', 'select', etc.
      default: 100,
      min: 0,
      max: 500,
      description: 'What this parameter does'
    }
    // ... more parameters
  ],
  examples: [
    { name: 'Example 1', myParam: 50 }
  ]
}
```

The UI will automatically:
- Add the endpoint to the sidebar
- Generate appropriate input controls
- Handle parameter validation
- Build URLs with the correct query parameters
- Show live preview

## 📦 Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI component library
- **Zustand** - State management
- **Lucide React** - Icons

## 🎨 Supported Parameter Types

- `number` - Numeric input with min/max/step
- `text` - Text input
- `color` - Color picker + text input
- `multiColor` - Comma-separated colors with visual preview
- `select` - Dropdown with predefined options
- `timestamp` - DateTime picker with Unix timestamp support
- `url` - URL input

## 📝 Examples

Each endpoint includes example presets to help users get started quickly. Examples are defined in the endpoint configuration and can be loaded with one click.

## 🌙 Dark Mode

The application automatically supports dark mode based on system preferences using Tailwind CSS's dark mode utilities.

## 📄 License

ISC

