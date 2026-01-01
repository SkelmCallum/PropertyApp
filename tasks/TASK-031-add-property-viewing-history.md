# TASK-031: Add Property Viewing History

## Priority
P3 (Low)

## Status
🔴 Not Started

## Description
Track which properties users have viewed to provide a viewing history feature. This can help users remember properties they've seen.

## Requirements
1. Track property views (when user visits detail page)
2. Store viewing history in database or local storage
3. Create viewing history page
4. Show recently viewed properties
5. Allow clearing history

## Technical Details
- Can use database for logged-in users
- Can use localStorage for all users
- Track view timestamp

## Database Schema (if using database)
```sql
CREATE TABLE property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
```

## Implementation Steps
1. Track view when property detail page loads
2. Store in database (logged-in) or localStorage (all users)
3. Create viewing history page
4. Display recently viewed properties
5. Add clear history option

## Code Locations
- Update: `src/app/listings/[id]/page.tsx` (track view)
- Create: `src/app/history/page.tsx`
- Create: `src/app/api/property-views/route.ts` (if using database)

## Implementation
```typescript
// On property detail page load
useEffect(() => {
  if (user) {
    // Store in database
    fetch('/api/property-views', {
      method: 'POST',
      body: JSON.stringify({ property_id: id })
    });
  } else {
    // Store in localStorage
    const history = JSON.parse(localStorage.getItem('propertyHistory') || '[]');
    const updated = [{ property_id: id, viewed_at: new Date() }, ...history]
      .slice(0, 50); // Keep last 50
    localStorage.setItem('propertyHistory', JSON.stringify(updated));
  }
}, [id, user]);
```

## Testing
- Test view tracking
- Test history display
- Test clearing history
- Test with logged-in and logged-out users

## Dependencies
- User authentication (optional, can work without)

