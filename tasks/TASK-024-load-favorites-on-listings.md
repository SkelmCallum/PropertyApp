# TASK-024: Load User's Favorites on Listings Page Load

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The listings page should load the user's favorites when the page loads so that favorite icons are correctly displayed.

## Requirements
1. Fetch user's favorites on component mount
2. Store favorite property IDs in state
3. Update PropertyCard components with correct favorite status
4. Handle loading state
5. Handle unauthenticated users (no favorites)

## Technical Details
- File: `src/app/listings/page.tsx`
- API: `GET /api/favorites`
- Should be done in useEffect on mount

## Implementation
This is part of TASK-023. See that task for full implementation details.

## Code Location
- Update: `src/app/listings/page.tsx`

## Quick Implementation
```typescript
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
```

## Dependencies
- Favorites API
- User authentication

