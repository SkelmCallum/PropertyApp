# TASK-006: Implement Property Status Management

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
Properties need to be marked as expired/rented when they're no longer found on source websites. Currently, properties remain "active" indefinitely even if they've been removed from the source.

## Requirements
1. Track which properties are found during each scraping run
2. Mark properties as "expired" if they're not found in recent scraping runs
3. Update `last_seen_at` timestamp when property is found
4. Implement logic to determine when a property should be marked expired
5. Create a cleanup job to mark old properties as expired

## Technical Details
- Database field: `status` (active, pending, rented, expired)
- Database field: `last_seen_at` (timestamp)
- Properties should be marked expired if not seen for X days (e.g., 7 days)

## Implementation Steps
1. During scraping, track which external_ids are found
2. After scraping completes, query database for properties from same source
3. Mark properties as "expired" if:
   - They weren't found in the current scraping run
   - AND `last_seen_at` is older than threshold (e.g., 7 days)
4. Create a scheduled job (Supabase cron or Edge Function) to:
   - Periodically check for properties not seen in X days
   - Mark them as expired
   - Optionally delete very old expired properties

## Code Location
- Update: `src/app/api/listings/route.ts` (triggerScraping function)
- Update: `supabase/functions/scrape-properties/index.ts`
- Create: `supabase/functions/mark-expired-properties/index.ts` (scheduled job)

## Logic
```typescript
// After scraping completes
const foundExternalIds = new Set(scrapedProperties.map(p => p.external_id));

// Find properties from same source that weren't found
const { data: missingProperties } = await supabase
  .from('properties')
  .select('id, external_id, last_seen_at')
  .eq('source', source)
  .eq('status', 'active')
  .not('external_id', 'in', `(${Array.from(foundExternalIds).join(',')})`);

// Mark as expired if last_seen_at is old
for (const prop of missingProperties) {
  const daysSinceLastSeen = (Date.now() - new Date(prop.last_seen_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSeen > 7) {
    await supabase
      .from('properties')
      .update({ status: 'expired' })
      .eq('id', prop.id);
  }
}
```

## Testing
- Test with properties that disappear from source
- Test with properties that reappear
- Test expiration threshold logic
- Test scheduled cleanup job

## Dependencies
- Supabase cron jobs or scheduled Edge Functions

