# TASK-009: Store Scam Flags in Database When Calculating Scores

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
When scam scores are calculated, the scam flags should be stored in the database. Currently, flags are calculated but may not be stored properly.

## Requirements
1. Extract flag types from ScamAnalysis
2. Store flags as array in scam_flags field
3. Update flags whenever score is recalculated
4. Ensure flags are stored in correct format (TEXT[])

## Technical Details
- Database field: `scam_flags` (TEXT[])
- ScamAnalysis contains: `flags: ScamFlag[]` where each flag has a `type` property
- Need to extract `type` from each flag

## Implementation Steps
1. When calculating scam score, extract flag types
2. Store as array of strings in database
3. Update in both scraping and update flows

## Code Location
- Update: `src/app/api/listings/route.ts` (triggerScraping)
- Update: `supabase/functions/scrape-properties/index.ts`
- Update: Anywhere scam scores are calculated

## Implementation
```typescript
const analysis = scamDetector.analyze(property);
const flagTypes = analysis.flags.map(flag => flag.type);

// Store in database
await supabase
  .from('properties')
  .update({
    scam_score: analysis.score,
    scam_flags: flagTypes
  })
  .eq('id', propertyId);
```

## Flag Types
Possible flag types from ScamDetector:
- `suspicious_price`
- `low_price`
- `suspicious_keyword`
- `unrealistic_offer`
- `vague_description`
- `missing_contact`
- `international_phone`
- `personal_email`
- `no_images`
- `few_images`
- `unknown_agency`

## Testing
- Verify flags are stored correctly
- Test with properties that have multiple flags
- Test with properties that have no flags
- Verify flags update when score recalculates

## Dependencies
- Scam score calculation (TASK-007)

