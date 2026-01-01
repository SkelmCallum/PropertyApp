# TASK-023: Connect Favorite Toggle to API on Listings Page

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The listings page has favorite toggle functionality in the UI, but it only updates local state. We need to connect it to the favorites API to persist favorites.

## Requirements
1. Load user's favorites on page load
2. Update favorite state from API response
3. Call API when favorite is toggled
4. Handle API errors gracefully
5. Show loading state during API calls
6. Update UI optimistically

## Technical Details
- File: `src/app/listings/page.tsx`
- Current implementation: Lines 27, 67-77 (local state only)
- API: `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites`

## Implementation Steps
1. Fetch favorites on component mount
2. Create Set of favorite property IDs
3. Update `isFavorite` check to use API data
4. Update `toggleFavorite` to call API:
   - If adding: POST to `/api/favorites`
   - If removing: DELETE to `/api/favorites`
5. Update local state after successful API call
6. Handle errors and show feedback

## Code Location
- Update: `src/app/listings/page.tsx`

## Current Code Issues
```typescript
// Line 27: Local state only
const [favorites, setFavorites] = useState<Set<string>>(new Set());

// Line 67-77: Only updates local state
const toggleFavorite = (propertyId: string) => {
  setFavorites(prev => {
    const next = new Set(prev);
    if (next.has(propertyId)) {
      next.delete(propertyId);
    } else {
      next.add(propertyId);
    }
    return next;
  });
};
```

## Updated Implementation
```typescript
// Fetch favorites on mount
useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.favorites.map((f: any) => f.properties.id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };
  fetchFavorites();
}, []);

// Update toggleFavorite to call API
const toggleFavorite = async (propertyId: string) => {
  const isCurrentlyFavorite = favorites.has(propertyId);
  
  // Optimistic update
  setFavorites(prev => {
    const next = new Set(prev);
    if (isCurrentlyFavorite) {
      next.delete(propertyId);
    } else {
      next.add(propertyId);
    }
    return next;
  });

  try {
    if (isCurrentlyFavorite) {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId })
      });
    } else {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: propertyId })
      });
    }
  } catch (error) {
    // Revert on error
    setFavorites(prev => {
      const next = new Set(prev);
      if (isCurrentlyFavorite) {
        next.add(propertyId);
      } else {
        next.delete(propertyId);
      }
      return next;
    });
    console.error('Failed to toggle favorite:', error);
  }
};
```

## Testing
- Test loading favorites on page load
- Test adding favorite
- Test removing favorite
- Test error handling
- Test with unauthenticated user
- Test favorite persistence across page refreshes

## Dependencies
- Favorites API (already exists)
- User authentication

