# Live Image Generator

A collection of serverless functions that generate dynamic SVG images on-demand. Built with Netlify Functions.

## Endpoints

### Progress Bar

Generates a horizontal progress bar with customizable appearance.

**URL:** `/progress-bar.svg`

**Parameters:**
- `value` (number, 0-100): Progress percentage (default: 50)
- `color` (hex color or comma-separated list): Progress bar color(s) (default: #3B82F6)
  - Single color: `#3B82F6`
  - Multiple colors: `#FF0000,#00FF00,#0000FF` (creates gradient based on progress value)
- `aspectRatio` (number): Width-to-height ratio (default: 4)

**Example:**
```
/progress-bar.svg?value=75&color=%23FF6B6B&aspectRatio=3
/progress-bar.svg?value=50&color=%23FF0000,%2300FF00&aspectRatio=4
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
- `color` (hex color or comma-separated list): Progress arc color(s) (default: #3B82F6)
  - Single color: `#3B82F6`
  - Multiple colors: `#FF0000,#00FF00,#0000FF` (creates gradient based on progress value)
- `size` (number): Overall size in pixels (default: 200)
- `strokeWidth` (number): Width of the donut ring (default: 20)
- `padding` (number): Padding around the donut in pixels (default: 10)

**Example:**
```
/progress-donut.svg?value=70&color=%23FF6B6B&size=300&strokeWidth=30&padding=15
/progress-donut.svg?value=50&color=%23FF0000,%2300FF00&size=250&strokeWidth=25
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

### Datetime

Generates a calendar and clock icon showing a specific date and time.

**URL:** `/datetime.svg`

**Parameters:**
- `timestamp` (number): Unix timestamp in milliseconds or seconds (default: current time)
- `size` (number): Icon size in pixels (default: 128, range: 32-512)
- `padding` (number): Padding around the icon (default: 10, range: 0-100)
- `mode` (string): Display mode (default: "datetime")
  - `datetime` - Show both calendar and clock
  - `date` - Show only calendar
  - `time` - Show only clock
- `header` (hex color): Month header color (default: #EF5350)
- `stroke` (hex color): Outline and text color (default: #0B0B0B)

**Example:**
```
/datetime.svg?timestamp=1704067200000&size=200&mode=datetime&header=%23FF6B6B
/datetime.svg?timestamp=1704067200&mode=date&header=%2310B981
/datetime.svg?timestamp=1704067200000&mode=time&size=150
```

**Features:**
- Calendar with month header and day number
- Analog clock with hour and minute hands
- Clock positioned as overlay in bottom-right corner
- Rounded corners and professional styling
- Support for both millisecond and second timestamps
- Customizable colors and sizing
- Three display modes for flexibility

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
- Transparency support with alpha channel

### User Card

Generates a modern user profile card with circular avatar, name, email, and description.

**URL:** `/user-card.svg`

**Parameters:**
- `name` (string): Full name (default: "User Name")
- `firstName` (string): First name (alternative to `name`)
- `lastName` (string): Last name (alternative to `name`)
- `email` (string): Email address
- `description` (string): Job title or description (aliases: `title`, `job`)
- `image` (string): Image URL for avatar (alias: `avatar`)
- `ratio` (string): Aspect ratio (default: "16:9", format: "width:height")
- `padding` (number): Padding around the card (default: 24, range: 0-100)
- `bgColor` (hex color or "transparent"): Background color (alias: `bg`, default: transparent)
- `primaryColor` (hex color): Primary accent color (alias: `primary`, default: #3B82F6)
- `textColor` (hex color): Main text color (alias: `text`, default: #1F2937)
- `subtextColor` (hex color): Secondary text color (alias: `subtext`, default: #6B7280)

**Example:**
```
/user-card.svg?name=John%20Doe&email=john@example.com&description=Software%20Engineer&image=https://example.com/avatar.jpg
/user-card.svg?firstName=Jane&lastName=Smith&email=jane@company.com&description=Product%20Manager&ratio=4:3&primary=%23FF6B6B
```

**Features:**
- Landscape orientation with circular avatar on the left
- Automatic image cropping to circle with fallback placeholder
- Responsive text sizing and truncation
- Modern design with subtle shadows and rounded corners
- Customizable aspect ratios (16:9, 4:3, 3:2, etc.)
- Professional typography and spacing
- Flexible name input (full name or first/last separately)

### Stars

Generates a star rating display with configurable total stars and filled stars.

**URL:** `/stars.svg`

**Parameters:**
- `total` (number): Total number of stars to display (default: 5, range: 1-10)
- `value` (number): Number of filled stars (default: 0, range: 0 to total)
- `color` (hex color): Color for filled stars (default: #FFD700)
- `size` (number): Overall size in pixels (default: 200, range: 32-512)
- `padding` (number): Padding around the stars (default: 10, range: 0-100)

**Example:**
```
/stars.svg?total=5&value=3&color=%23FFD700
/stars.svg?total=10&value=7.5&color=%23FF6B6B&size=300&padding=15
/stars.svg?total=3&value=2&color=%2310B981&size=150
```

**Features:**
- 5-pointed star design using golden ratio proportions
- Support for partial star ratings (e.g., 3.5 out of 5 stars)
- Empty stars shown as gray outlines
- Filled stars in customizable color
- Responsive sizing and spacing
- User-configurable padding for consistency with other endpoints

## Usage Examples

### Progress Bar Examples
- `/progress-bar.svg?value=25` - 25% progress with default blue color
- `/progress-bar.svg?value=100&color=%2310B981` - Complete green progress bar
- `/progress-bar.svg?value=50&color=%23F59E0B&aspectRatio=2` - Yellow progress bar with 2:1 aspect ratio
- `/progress-bar.svg?value=75&color=%23FF0000,%2300FF00` - Red to green gradient, 75% progress (greenish)
- `/progress-bar.svg?value=30&color=%23FF0000,%23FFFF00,%2300FF00` - Red to yellow to green gradient, 30% progress (reddish-yellow)

### Progress Donut Examples
- `/progress-donut.svg?value=70` - 70% progress with default blue color
- `/progress-donut.svg?value=100&color=%2310B981` - Complete green donut
- `/progress-donut.svg?value=30&color=%23F59E0B&size=300&strokeWidth=25` - Large yellow donut with thick stroke
- `/progress-donut.svg?value=85&color=%23EF4444&padding=20` - Red donut with extra padding
- `/progress-donut.svg?value=60&color=%23FF0000,%2300FF00` - Red to green gradient, 60% progress (greenish)
- `/progress-donut.svg?value=40&color=%23FF0000,%23FFFF00,%2300FF00` - Red to yellow to green gradient, 40% progress (yellowish)

### Pill Examples
- `/pill.svg?text=New&color=%23EF4444` - Red pill with "New" text
- `/pill.svg?text=Warning&color=%23F59E0B&textColor=%23000000` - Yellow warning pill with black text
- `/pill.svg?text=Completed&color=%2310B981` - Green success pill

### Datetime Examples
- `/datetime.svg` - Current date and time with default styling
- `/datetime.svg?timestamp=1704067200000` - Specific date (Jan 1, 2024) with both calendar and clock
- `/datetime.svg?timestamp=1704067200&mode=date` - Date only (calendar without clock)
- `/datetime.svg?timestamp=1704067200000&mode=time` - Time only (clock without calendar)
- `/datetime.svg?size=200&header=%23FF6B6B` - Larger icon with red header
- `/datetime.svg?timestamp=1704067200000&mode=datetime&stroke=%2310B981` - Green outline and text
- `/datetime.svg?timestamp=1704067200000&padding=20&size=150` - Custom padding and size

### Gradient Examples
- `/gradient.svg?colors=%23FF6B6B` - Solid red color
- `/gradient.svg?colors=%23FF6B6B,%23FECA57` - Red to yellow gradient
- `/gradient.svg?colors=%23FF6B6B,%23FECA57,%2310B981&direction=to%20bottom` - Three-color vertical gradient
- `/gradient.svg?colors=%233B82F6,%23EF4444&direction=45deg` - Blue to red diagonal gradient
- `/gradient.svg?colors=%23F59E0B,%23EF4444&stops=0%25,80%25&width=800&height=200` - Custom stop positions
- `/gradient.svg?colors=%23FF6B6B80,%23FECA57` - Red with 50% transparency to yellow
- `/gradient.svg?colors=%233B82F600,%233B82F6FF` - Transparent to opaque blue gradient

### User Card Examples
- `/user-card.svg?name=John%20Doe&email=john@example.com&description=Software%20Engineer` - Basic user card
- `/user-card.svg?firstName=Jane&lastName=Smith&email=jane@company.com&description=Product%20Manager` - Using separate first/last name
- `/user-card.svg?name=Alex%20Johnson&email=alex@startup.com&description=CEO&image=https://example.com/avatar.jpg` - With custom avatar
- `/user-card.svg?name=Sarah%20Wilson&email=sarah@design.com&description=UI/UX%20Designer&ratio=4:3&primary=%23FF6B6B` - Custom aspect ratio and colors
- `/user-card.svg?name=Mike%20Chen&email=mike@tech.com&description=Full%20Stack%20Developer&bg=%23F8F9FA&text=%232D3748` - Custom background and text colors
- `/user-card.svg?name=Lisa%20Wang&email=lisa@design.com&description=Creative%20Director` - Transparent background (default)
- `/user-card.svg?name=Tom%20Brown&email=tom@startup.com&description=CTO&padding=10` - Reduced padding

### Stars Examples
- `/stars.svg?total=5&value=3` - 3 out of 5 stars with default gold color
- `/stars.svg?total=5&value=4.5&color=%23FFD700` - 4.5 out of 5 stars (partial star)
- `/stars.svg?total=10&value=7&color=%23FF6B6B&size=300` - 7 out of 10 stars in red
- `/stars.svg?total=3&value=2&color=%2310B981&size=150&padding=15` - 2 out of 3 stars in green with custom padding
- `/stars.svg?total=5&value=0&color=%23F59E0B` - Empty 5-star rating (all gray outlines)
- `/stars.svg?total=5&value=5&color=%23FFD700` - Full 5-star rating

## Color Format

All color parameters accept hex color codes:
- 6-digit: `#3B82F6`
- 3-digit: `#F00` (shorthand for `#FF0000`)
- 8-digit: `#3B82F680` (6-digit + 2-digit alpha for transparency)
- 4-digit: `#F008` (3-digit + 1-digit alpha for transparency)

**Transparency Examples:**
- `#FF0000` - Fully opaque red
- `#FF000080` - 50% transparent red
- `#FF000000` - Fully transparent red
- `#FF0000FF` - Fully opaque red

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
   - `http://localhost:8888/datetime.svg`
   - `http://localhost:8888/gradient.svg`
   - `http://localhost:8888/user-card.svg`
   - `http://localhost:8888/stars.svg`
    - `http://localhost:8888/blurred-background.svg`

## Technical Details

- **Framework:** Netlify Functions
- **Language:** Node.js
- **Output Format:** SVG (scalable vector graphics)
- **Caching:** 5-minute cache for better performance
- **Validation:** Color format validation for all endpoints
 
### Blurred Background

Generates a soft, pastel-style backdrop using overlapping radial gradients with an SVG blur.

**URL:** `/blurred-background.svg`

**Parameters:**
- `width` (number): Image width in px (default: 1200)
- `height` (number): Image height in px (default: 800)
- `colors` (comma-separated hex): Palette to sample blobs from (supports alpha; default: `#FF7A59,#FFD166,#7BDFF2,#B794F4,#6EE7B7`)
- `num` (number): Number of blobs (2–24, default: 8)
- `blur` (number): Blur radius in SVG user units; defaults to ~8% of min(width,height)
- `opacity` (0–1): Base opacity for blobs (default: 0.85)
- `bg` (hex or `transparent`): Background (default: `#EEF2FF`)
- `seed` (string): Seed for deterministic output (default derived from inputs)

**Examples:**
```
/blurred-background.svg?width=1600&height=900&num=10&colors=%23FF8FAB,%23BDE0FE,%23CDB4DB,%23FDE68A&bg=%23F8FAFF
/blurred-background.svg?width=1200&height=800&seed=homepage&opacity=0.9&blur=120
```

**Notes:**
- Output is pure SVG; scales crisply and is small.
- Uses seeded PRNG for reproducibility across deployments.
