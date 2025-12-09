# Progress Bar API - Usage Examples

## Quick Start

Basic progress bar:
```
/progress-bar.svg?value=75
```

## Single Value Progress Bars

### Basic Progress
```
/progress-bar.svg?value=50&color=%233B82F6&bg=%23E5E7EB
```
- ✅ Smart rounding: rounded left edge, square right edge at low values
- ✅ Both edges rounded at 95%+ progress

### With Gradient
```
/progress-bar.svg?value=60&color=%233B82F6,%238B5CF6,%23EC4899
```
- Multiple colors create a gradient across the progress fill

### Custom Dimensions
```
/progress-bar.svg?value=45&aspectRatio=8&padding=10
```
- `aspectRatio`: Width/height ratio (default: 4)
- `padding`: Space around the bar in pixels (default: 20)

### Custom Border Radius
```
/progress-bar.svg?value=30&radius=8
```
- `radius`: Corner radius in pixels (omit for auto/fully rounded)

## Segmented Progress Bars

### Basic Segmented
```
/progress-bar.svg?value=65&segments=10&gap=6
```
- Splits bar into 10 segments with 6px gaps
- Smart rounding applied per segment

### Segmented with Gradient
```
/progress-bar.svg?value=70&color=%233B82F6,%238B5CF6,%23EC4899&segments=10
```
- Colors transition across all segments

## 🆕 Multi-Value Progress Bars

### Two Sections
```
/progress-bar.svg?values=40:%238B5CF6,35:%23EC4899
```
- First section: 40% in purple
- Second section: 35% in pink
- Total: 75% filled

### Three Sections (Task Progress)
```
/progress-bar.svg?values=30:%233B82F6,40:%2310B981,20:%23F59E0B
```
- Planning: 30% blue
- Development: 40% green  
- Testing: 20% orange
- Total: 90% filled

### Four Sections (Resource Allocation)
```
/progress-bar.svg?values=25:%23EF4444,20:%23F59E0B,30:%23EAB308,15:%2310B981
```
- CPU: 25% red
- Memory: 20% orange
- Disk: 30% yellow
- Network: 15% green
- Total: 90% filled

## Advanced Features

### Gradient Span Control
```
/progress-bar.svg?value=50&color=%233B82F6,%23EC4899&gradientSpan=progress
```
- `gradientSpan=bar` (default): Gradient maps to full bar width
- `gradientSpan=progress`: Gradient maps to filled portion only

### Different Aspect Ratios
```
// Thin bar (8:1)
/progress-bar.svg?value=35&aspectRatio=8

// Thick bar (2:1)
/progress-bar.svg?value=35&aspectRatio=2
```

### Custom Colors
```
/progress-bar.svg?value=30&color=%23F59E0B&bg=%23FEF3C7
```
- Amber progress on light amber background

## Use Cases

### GitHub Contributions
```
/progress-bar.svg?values=40:%2310B981,30:%2334D399,20:%236EE7B7&bg=%23E5E7EB
```

### Survey Results
```
/progress-bar.svg?values=45:%2310B981,30:%236B7280,15:%23EF4444
// Agree: 45%, Neutral: 30%, Disagree: 15%
```

### Project Milestones
```
/progress-bar.svg?values=25:%233B82F6,35:%238B5CF6,20:%23EC4899,10:%23F472B6
// Phase 1-4 progress
```

### Learning Progress
```
/progress-bar.svg?values=50:%2310B981,25:%23F59E0B&segments=10&gap=4
// Completed: 50%, In Progress: 25%
```

### Storage Usage
```
/progress-bar.svg?values=35:%23EF4444,25:%23F59E0B,20:%23EAB308
// Critical: 35%, Warning: 25%, Normal: 20%
```

## Color Codes Reference

### Status Colors
- Success: `%2310B981` (green)
- Warning: `%23F59E0B` (orange)
- Error: `%23EF4444` (red)
- Info: `%233B82F6` (blue)

### Brand Colors
- Blue: `%233B82F6`
- Purple: `%238B5CF6`
- Pink: `%23EC4899`
- Green: `%2310B981`
- Yellow: `%23EAB308`
- Orange: `%23F59E0B`
- Red: `%23EF4444`

### Neutral Colors
- Gray 200: `%23E5E7EB` (light background)
- Gray 400: `%239CA3AF`
- Gray 600: `%234B5563`
- Gray 800: `%231F2937`

## Tips

1. **URL Encoding**: Use `%23` for `#` in colors (e.g., `%233B82F6` for `#3B82F6`)
2. **Multi-Value**: Ensure total doesn't exceed 100%
3. **Readability**: Use contrasting colors for adjacent sections
4. **Performance**: All images are cached at CDN edge for 30 days
5. **Accessibility**: Consider color contrast for visibility

## Parameter Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `value` | number | 50 | Progress percentage (0-100) |
| `values` | string | - | Multi-value sections: `value:color,value:color` |
| `color` | string | #3B82F6 | Color(s) for progress (comma-separated for gradient) |
| `bg` | string | #E5E7EB | Background track color |
| `aspectRatio` | number | 4 | Width to height ratio (1-10) |
| `padding` | number | 20 | Padding around bar in pixels (0-100) |
| `radius` | number | auto | Corner radius in pixels (omit for auto) |
| `segments` | number | 1 | Number of segments (1-50) |
| `gap` | number | 4 | Gap between segments in pixels (0-20) |
| `gradientSpan` | string | bar | 'bar' or 'progress' |

## Notes

- Smart border radius automatically applies for professional appearance
- Multi-value mode overrides `value` and `color` parameters
- All colors must be valid hex codes (#RGB or #RRGGBB)
- Images are SVG format (scales to any size without quality loss)
