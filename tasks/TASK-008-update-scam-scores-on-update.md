# TASK-008: Update Scam Scores When Properties Are Updated

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
When properties are updated (e.g., price changes, description updates), scam scores should be recalculated to reflect the new data.

## Requirements
1. Detect when property data changes
2. Recalculate scam score after update
3. Update scam_score and scam_flags in database
4. Handle updates from scraping and manual updates

## Technical Details
- Database trigger or application logic
- Use ScamDetector service
- Update both scam_score and scam_flags

## Implementation Options
1. **Database Trigger** (Recommended)
   - Create PostgreSQL trigger on properties table
   - Call Edge Function or use PL/pgSQL
2. **Application Logic**
   - Recalculate in scraping code after updates
   - Recalculate in API routes that update properties

## Recommended Approach
Use database trigger to automatically recalculate when property is updated.

## Implementation Steps
1. Create database function to calculate scam score
2. Create trigger that calls function on UPDATE
3. Or add recalculation in application code after updates

## Code Location
- Create: `supabase/migrations/XXXXX_add_scam_score_trigger.sql`
- Or update: `src/app/api/listings/route.ts` (after property updates)

## Database Trigger Example
```sql
CREATE OR REPLACE FUNCTION update_scam_score()
RETURNS TRIGGER AS $$
BEGIN
  -- This would need to call the ScamDetector logic
  -- May need to use Edge Function or PL/pgSQL implementation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_scam_score_update
  AFTER UPDATE ON properties
  FOR EACH ROW
  WHEN (OLD.price IS DISTINCT FROM NEW.price 
     OR OLD.description IS DISTINCT FROM NEW.description
     OR OLD.agent_email IS DISTINCT FROM NEW.agent_email)
  EXECUTE FUNCTION update_scam_score();
```

## Alternative: Application Logic
After updating property in code:
```typescript
// After property update
const analysis = scamDetector.analyze(updatedProperty);
await supabase
  .from('properties')
  .update({
    scam_score: analysis.score,
    scam_flags: analysis.flags.map(f => f.type)
  })
  .eq('id', propertyId);
```

## Testing
- Test score recalculation after price change
- Test score recalculation after description update
- Test score recalculation after contact info update
- Verify flags are updated correctly

## Dependencies
- ScamDetector service

