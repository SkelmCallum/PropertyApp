# TASK-028: Implement Saved Searches (Premium Feature)

## Priority
P2 (Medium)

## Status
🔴 Not Started

## Description
Premium users should be able to save their search criteria and receive notifications when new properties match their saved searches.

## Requirements
1. Create saved_searches table (if not exists)
2. Allow users to save current search filters
3. Store search criteria (filters, city, etc.)
4. Create API endpoints for saved searches
5. Create UI to manage saved searches
6. Implement notification system (TASK-029)
7. Gate behind premium status

## Technical Details
- Premium feature only
- Need to store search filters as JSON
- Should include: city, suburbs, property types, price range, bedrooms, etc.

## Database Schema
```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

## Implementation Steps
1. Create database migration for saved_searches table
2. Create API endpoints:
   - GET /api/saved-searches (list user's saved searches)
   - POST /api/saved-searches (create saved search)
   - PUT /api/saved-searches/[id] (update saved search)
   - DELETE /api/saved-searches/[id] (delete saved search)
3. Add "Save Search" button on listings page
4. Create saved searches management page
5. Add premium check before allowing save

## Code Locations
- Create: `supabase/migrations/XXXXX_create_saved_searches_table.sql`
- Create: `src/app/api/saved-searches/route.ts`
- Create: `src/app/api/saved-searches/[id]/route.ts`
- Update: `src/app/listings/page.tsx` (add save button)
- Create: `src/app/saved-searches/page.tsx`

## Saved Search Data Structure
```typescript
{
  name: "2 Bedroom Apartments in Sea Point",
  filters: {
    city: "cape-town",
    suburbs: ["sea-point"],
    property_types: ["apartment"],
    min_bedrooms: 2,
    max_bedrooms: 2,
    min_price: 8000,
    max_price: 15000
  }
}
```

## Testing
- Test creating saved search
- Test listing saved searches
- Test updating saved search
- Test deleting saved search
- Test premium gating
- Test search criteria persistence

## Dependencies
- Premium status checks (TASK-016)
- Database migration

