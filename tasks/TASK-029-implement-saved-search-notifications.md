# TASK-029: Implement Saved Search Notifications

## Priority
P2 (Medium)

## Status
🔴 Not Started

## Description
Premium users with saved searches should receive email notifications when new properties match their search criteria.

## Requirements
1. Create job to check saved searches against new properties
2. Match properties against saved search criteria
3. Send email notifications for new matches
4. Track which properties have been notified (avoid duplicates)
5. Allow users to configure notification frequency
6. Gate behind premium status

## Technical Details
- Premium feature only
- Should run periodically (e.g., daily or after scraping)
- Need to track notified properties per saved search

## Implementation Steps
1. Create Supabase Edge Function or scheduled job
2. Query all active saved searches
3. For each saved search:
   - Query properties matching criteria
   - Filter out properties already notified
   - Send email notification
   - Record notification in database
4. Create notification tracking table
5. Create email template for notifications

## Database Schema
```sql
CREATE TABLE saved_search_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_search_id UUID NOT NULL REFERENCES saved_searches(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  notified_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(saved_search_id, property_id)
);
```

## Code Locations
- Create: `supabase/functions/check-saved-searches/index.ts`
- Create: `supabase/migrations/XXXXX_create_notifications_table.sql`
- Create email template for notifications

## Notification Logic
1. Run after property scraping completes
2. For each saved search:
   - Build query from saved search filters
   - Find properties created in last 24 hours
   - Exclude properties already notified for this search
   - Send email with matching properties
   - Record notifications

## Email Template
```
Subject: New Properties Match Your Search: [Search Name]

Hi [User],

We found [X] new properties that match your saved search:

[Property 1]
📍 [Location]
💰 R[Price]
[Link]

[Property 2]
...

View all matches: [Link to filtered listings]

Manage your saved searches: [Link]
```

## Testing
- Test matching logic
- Test notification sending
- Test duplicate prevention
- Test with multiple saved searches
- Test email formatting

## Dependencies
- Saved searches (TASK-028)
- Email sending (TASK-010)
- Premium status (TASK-016)
- Scheduled jobs (Supabase cron)

