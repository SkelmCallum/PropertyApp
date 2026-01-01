# TASK-004: Implement Scraping in Supabase Edge Function

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The Supabase Edge Function `scrape-properties` currently has placeholder logic. We need to implement actual scraping that calls the scraper classes and saves results to the database.

## Requirements
1. Call ScraperOrchestrator from the Edge Function
2. Process scraped properties
3. Calculate scam scores for each property
4. Upsert properties to database
5. Update scraping job status
6. Handle errors gracefully
7. Return proper response with job status

## Technical Details
- File: `supabase/functions/scrape-properties/index.ts`
- Currently has TODO comment at line 80
- Needs to integrate with `ScraperOrchestrator` from `@/lib/scrapers/scraper-orchestrator`

## Implementation Steps
1. Import ScraperOrchestrator (may need to adapt for Deno environment)
2. Create orchestrator instance with request parameters
3. Run scraping
4. For each scraped property:
   - Calculate scam score using ScamDetector
   - Prepare property data for database
5. Upsert properties in batches
6. Update scraping job with results
7. Handle errors and update job status accordingly

## Code Location
The Edge Function currently has:
```typescript
// TODO: Implement actual scraping logic here
// This would use the scraper classes with Cheerio for HTML parsing
```

## Challenges
- Edge Functions run in Deno, not Node.js
- May need to adapt scraper code for Deno environment
- Import paths may need adjustment
- Consider using Deno-compatible libraries

## Testing
- Test Edge Function locally
- Test with different source parameters
- Test error handling
- Verify database updates

## Dependencies
- ScraperOrchestrator must work in Deno environment
- May need to refactor scrapers for Deno compatibility

