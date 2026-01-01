# TASK-020: Implement Favorite Toggle on Property Detail Page

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The property detail page has a "Save" button that doesn't work. We need to implement the favorite toggle functionality.

## Requirements
1. Check if property is already in user's favorites
2. Toggle favorite on button click
3. Call favorites API (POST to add, DELETE to remove)
4. Update button state (filled/unfilled heart icon)
5. Show success feedback
6. Handle unauthenticated users (redirect to login)

## Technical Details
- File: `src/app/listings/[id]/page.tsx`
- Button at line 296: `<Button variant="outline" size="sm">Save</Button>`
- API: `POST /api/favorites` (add), `DELETE /api/favorites` (remove)
- Need to check current favorite status on page load

## Implementation Steps
1. Add state for favorite status
2. Fetch favorite status on page load
3. Update button to show filled/unfilled heart
4. Handle button click:
   - If not favorited: POST to `/api/favorites`
   - If favorited: DELETE to `/api/favorites`
5. Update local state after API call
6. Show toast/feedback on success

## Code Location
- Update: `src/app/listings/[id]/page.tsx`

## Button States
- Not favorited: Outline heart icon, "Save" text
- Favorited: Filled heart icon, "Saved" text
- Loading: Disabled state with spinner

## API Integration
```typescript
// Check if favorited
const { data: favorites } = await fetch('/api/favorites');
const isFavorited = favorites.some(f => f.properties.id === propertyId);

// Toggle favorite
if (isFavorited) {
  await fetch('/api/favorites', {
    method: 'DELETE',
    body: JSON.stringify({ property_id: propertyId })
  });
} else {
  await fetch('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ property_id: propertyId })
  });
}
```

## Testing
- Test adding favorite
- Test removing favorite
- Test with unauthenticated user
- Test favorite status persistence
- Test UI updates correctly

## Dependencies
- Favorites API (already exists)
- User authentication

