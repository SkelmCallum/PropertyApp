# TASK-027: Add Image Fallback Handling

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
When property images fail to load (broken URLs, 404s), we should show a fallback image instead of a broken image icon.

## Requirements
1. Detect image load errors
2. Show fallback image on error
3. Use appropriate fallback (placeholder, default property image)
4. Handle missing images gracefully

## Technical Details
- Next.js Image component supports onError handler
- Should show placeholder image
- Can use SVG or data URI for placeholder

## Implementation Steps
1. Create fallback image component or use placeholder
2. Add onError handler to Image components
3. Update state to show fallback on error
4. Apply to all image displays

## Code Locations
- Update: `src/components/property-card.tsx`
- Update: `src/app/listings/[id]/page.tsx`
- Create: `src/components/image-with-fallback.tsx` (optional)

## Implementation
```typescript
const [imageError, setImageError] = useState(false);
const [imageSrc, setImageSrc] = useState(property.images[0]);

<Image
  src={imageError ? '/placeholder-property.jpg' : imageSrc}
  alt={property.title}
  onError={() => setImageError(true)}
  // ... other props
/>
```

## Fallback Options
1. **Placeholder Image**: Static image file
2. **SVG Placeholder**: Inline SVG
3. **Data URI**: Base64 encoded image
4. **Icon**: Property icon from icon library

## Testing
- Test with broken image URLs
- Test with missing images
- Test fallback display
- Test on different components

## Dependencies
- None

