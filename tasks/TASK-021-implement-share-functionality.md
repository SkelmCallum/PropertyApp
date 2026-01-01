# TASK-021: Implement Share Functionality

## Priority
P2 (Medium)

## Status
🔴 Not Started

## Description
The property detail page has a "Share" button that doesn't work. We need to implement sharing functionality to allow users to share property listings.

## Requirements
1. Implement Web Share API (native sharing)
2. Fallback to copy link for browsers without Web Share API
3. Generate shareable URL for property
4. Include property preview in share (title, image, price)
5. Support sharing to:
   - Social media (Facebook, Twitter, WhatsApp)
   - Email
   - Copy link
   - Native share sheet (mobile)

## Technical Details
- File: `src/app/listings/[id]/page.tsx`
- Button at line 300: `<Button variant="outline" size="sm">Share</Button>`
- Share URL format: `https://propertyapp.com/listings/{id}`

## Implementation Steps
1. Create share utility function
2. Implement Web Share API with fallback
3. Create share menu/modal with options
4. Generate share text with property details
5. Handle different share methods

## Code Location
- Update: `src/app/listings/[id]/page.tsx`
- Create: `src/lib/utils/share.ts`

## Share Options
1. **Web Share API** (preferred, native)
   - Works on mobile browsers
   - Shows native share sheet
2. **Copy Link**
   - Copy URL to clipboard
   - Show "Link copied!" feedback
3. **Social Media**
   - Facebook: Share dialog
   - Twitter: Tweet with link
   - WhatsApp: Share via WhatsApp
4. **Email**
   - Open mailto: link with subject and body

## Share Text Format
```
Check out this property: [Title]

📍 [Suburb, City]
💰 R[Price]
🛏️ [Bedrooms] bed | 🛁 [Bathrooms] bath

[Property URL]
```

## Implementation Example
```typescript
async function handleShare() {
  const shareData = {
    title: property.title,
    text: `Check out this property: ${property.title} - R${property.price}`,
    url: `${window.location.origin}/listings/${property.id}`
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // User cancelled or error
    }
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(shareData.url);
    showToast('Link copied!');
  }
}
```

## Testing
- Test Web Share API on mobile
- Test copy link fallback
- Test social media sharing
- Test email sharing
- Test on different browsers

## Dependencies
- None (uses browser APIs)

