# Live Image Generator

A collection of serverless functions that generate dynamic SVG images on-demand. Built with Netlify Functions.

## Endpoints

### Progress Bar

Generates a horizontal progress bar with customizable appearance.

**URL:** `/progress-bar.svg`

**Parameters:**
- `value` (number, 0-100): Progress percentage (default: 50)
- `color` (hex color): Progress bar color (default: #3B82F6)
- `aspectRatio` (number): Width-to-height ratio (default: 4)

**Example:**
```
/progress-bar.svg?value=75&color=%23FF6B6B&aspectRatio=3
```

**Features:**
- Rounded pill-shaped design
- Gradient effect for depth
- Subtle highlight at the top
- Responsive sizing based on aspect ratio
- Gray background for remaining progress

### Progress Donut

Generates a circular progress chart with donut shape and centered percentage display.

**URL:** `/progress-donut.svg`

**Parameters:**
- `value` (number, 0-100): Progress percentage (default: 50)
- `color` (hex color): Progress arc color (default: #3B82F6)
- `size` (number): Overall size in pixels (default: 200)
- `strokeWidth` (number): Width of the donut ring (default: 20)
- `padding` (number): Padding around the donut in pixels (default: 10)

**Example:**
```
/progress-donut.svg?value=70&color=%23FF6B6B&size=300&strokeWidth=30&padding=15
```

**Features:**
- Circular donut design with rounded ends
- Gradient effect on progress arc
- Centered percentage text in black
- Gray background for remaining progress
- Customizable size, stroke width, and padding
- Properly displays full colored circle at 100%

### Pill

Generates a pill-shaped element with customizable text and colors.

**URL:** `/pill.svg`

**Parameters:**
- `text` (string): Text to display inside the pill (default: "Pill")
- `color` (hex color): Background color of the pill (default: #3B82F6)
- `textColor` (hex color): Text color (default: #FFFFFF)

**Example:**
```
/pill.svg?text=Success&color=%2310B981&textColor=%23000000
```

**Features:**
- Responsive width based on text length
- Fully rounded ends
- Gradient background effect
- Centered text with professional typography
- Subtle highlight for depth

### Gradient

Generates color gradients or solid colors based on CSS linear-gradient functionality.

**URL:** `/gradient.svg`

**Parameters:**
- `colors` (comma-separated hex colors): One or more colors for the gradient (default: #3B82F6)
- `direction` (string): Gradient direction (default: "to right")
- `width` (number): Image width in pixels (default: 500)
- `height` (number): Image height in pixels (default: 300)
- `stops` (comma-separated percentages): Optional stop positions for colors (default: evenly distributed)

**Directions:**
- `to right` - Horizontal left to right
- `to left` - Horizontal right to left
- `to bottom` - Vertical top to bottom
- `to top` - Vertical bottom to top
- `to bottom right` - Diagonal top-left to bottom-right
- `to bottom left` - Diagonal top-right to bottom-left
- `to top right` - Diagonal bottom-left to top-right
- `to top left` - Diagonal bottom-right to top-left
- `45deg` - Custom angle (0-360 degrees)

**Example:**
```
/gradient.svg?colors=%23FF6B6B,%23FECA57,%2310B981&direction=to%20bottom&width=800&height=400
```

**Features:**
- Support for single colors (solid) or multiple colors (gradient)
- CSS linear-gradient compatible directions
- Custom stop positions for precise control
- Customizable dimensions
- Angle-based gradients (e.g., "45deg")

## Usage Examples

### Progress Bar Examples
- `/progress-bar.svg?value=25` - 25% progress with default blue color
- `/progress-bar.svg?value=100&color=%2310B981` - Complete green progress bar
- `/progress-bar.svg?value=50&color=%23F59E0B&aspectRatio=2` - Yellow progress bar with 2:1 aspect ratio

### Progress Donut Examples
- `/progress-donut.svg?value=70` - 70% progress with default blue color
- `/progress-donut.svg?value=100&color=%2310B981` - Complete green donut
- `/progress-donut.svg?value=30&color=%23F59E0B&size=300&strokeWidth=25` - Large yellow donut with thick stroke
- `/progress-donut.svg?value=85&color=%23EF4444&padding=20` - Red donut with extra padding

### Pill Examples
- `/pill.svg?text=New&color=%23EF4444` - Red pill with "New" text
- `/pill.svg?text=Warning&color=%23F59E0B&textColor=%23000000` - Yellow warning pill with black text
- `/pill.svg?text=Completed&color=%2310B981` - Green success pill

### Gradient Examples
- `/gradient.svg?colors=%23FF6B6B` - Solid red color
- `/gradient.svg?colors=%23FF6B6B,%23FECA57` - Red to yellow gradient
- `/gradient.svg?colors=%23FF6B6B,%23FECA57,%2310B981&direction=to%20bottom` - Three-color vertical gradient
- `/gradient.svg?colors=%233B82F6,%23EF4444&direction=45deg` - Blue to red diagonal gradient
- `/gradient.svg?colors=%23F59E0B,%23EF4444&stops=0%25,80%25&width=800&height=200` - Custom stop positions

## Color Format

All color parameters accept hex color codes:
- 6-digit: `#3B82F6`
- 3-digit: `#F00` (shorthand for `#FF0000`)

## Deployment

This project is deployed on Netlify with serverless functions. The functions are located in the `functions/` directory and are automatically deployed when pushed to the main branch.

## Development

To run locally:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Netlify dev server:
   ```bash
   netlify dev
   ```

3. Access endpoints at:
   - `http://localhost:8888/progress-bar.svg`
   - `http://localhost:8888/progress-donut.svg`
   - `http://localhost:8888/pill.svg`
   - `http://localhost:8888/gradient.svg`

## Technical Details

- **Framework:** Netlify Functions
- **Language:** Node.js
- **Output Format:** SVG (scalable vector graphics)
- **Caching:** 5-minute cache for better performance
- **Validation:** Color format validation for all endpoints
 
