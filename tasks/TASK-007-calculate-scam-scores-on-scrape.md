# TASK-007: Automatically Calculate Scam Scores When Properties Are Scraped

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
When properties are scraped and saved to the database, scam scores should be automatically calculated using the ScamDetector service. Currently, properties are saved with default scam_score of 0.

## Requirements
1. Import ScamDetector in scraping code
2. Calculate scam score for each property before saving
3. Store scam score in database
4. Store scam flags in database (scam_flags array)
5. Handle errors gracefully (don't fail scraping if scam detection fails)

## Technical Details
- Service: `src/lib/services/scam-detector.ts`
- Class: `ScamDetector` with `analyze()` method
- Returns: `ScamAnalysis` with `score`, `flags`, and `riskLevel`
- Database fields: `scam_score` (DECIMAL 3,2), `scam_flags` (TEXT[])

## Implementation Steps
1. Import ScamDetector in scraping code
2. After scraping each property, call `scamDetector.analyze(property)`
3. Extract score and flags from result
4. Include in property data when upserting:
   ```typescript
   scam_score: analysis.score,
   scam_flags: analysis.flags.map(f => f.type)
   ```

## Code Location
- Update: `src/app/api/listings/route.ts` (triggerScraping function, around line 215)
- Update: `supabase/functions/scrape-properties/index.ts` (around line 86)

## Example Implementation
```typescript
import { scamDetector } from '@/lib/services/scam-detector';

// After scraping property
const analysis = scamDetector.analyze(property);
const propertyToSave = {
  ...property,
  scam_score: analysis.score,
  scam_flags: analysis.flags.map(f => f.type),
  // ... other fields
};
```

## Testing
- Verify scam scores are calculated correctly
- Verify flags are stored correctly
- Test with properties that should have high scam scores
- Test with properties that should have low scam scores
- Ensure scraping doesn't fail if scam detection fails

## Dependencies
- ScamDetector service (already exists)

