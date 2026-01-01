# TASK-025: Implement Image URL Validation

## Priority
P2 (Medium)

## Status
🔴 Not Started

## Description
Property images are stored as URLs but there's no validation to ensure they're accessible or valid. We need to validate image URLs when properties are scraped.

## Requirements
1. Validate image URLs when properties are scraped
2. Check if images are accessible (HTTP 200)
3. Filter out invalid/broken image URLs
4. Store only valid image URLs in database
5. Handle image validation errors gracefully
6. Log validation failures for monitoring

## Technical Details
- Database field: `images` (TEXT[])
- Images are scraped from property sources
- Need to validate before saving to database

## Implementation Steps
1. Create image validation utility function
2. Validate each image URL:
   - Check URL format
   - Make HEAD request to check if accessible
   - Verify content-type is image
   - Handle timeouts
3. Filter invalid images before saving
4. Add validation in scraping process

## Code Location
- Create: `src/lib/utils/image-validation.ts`
- Update: `src/app/api/listings/route.ts` (triggerScraping)
- Update: `supabase/functions/scrape-properties/index.ts`

## Validation Function
```typescript
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // Check URL format
    new URL(url);
    
    // Check if accessible
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) return false;
    
    // Check content type
    const contentType = response.headers.get('content-type');
    return contentType?.startsWith('image/') ?? false;
  } catch {
    return false;
  }
}

export async function validateImageUrls(urls: string[]): Promise<string[]> {
  const validationPromises = urls.map(url => 
    validateImageUrl(url).then(valid => ({ url, valid }))
  );
  
  const results = await Promise.all(validationPromises);
  return results
    .filter(r => r.valid)
    .map(r => r.url);
}
```

## Implementation Notes
- Use HEAD requests to avoid downloading full images
- Set reasonable timeout (5 seconds)
- Validate in parallel for performance
- Cache validation results if possible
- Don't block property saving if validation fails

## Testing
- Test with valid image URLs
- Test with invalid URLs
- Test with broken links
- Test with non-image URLs
- Test timeout handling
- Test performance with many images

## Dependencies
- None (uses fetch API)

