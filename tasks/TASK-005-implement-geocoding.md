# TASK-005: Implement Geocoding Service

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
Properties are scraped with addresses but latitude/longitude are not populated. We need to implement geocoding to convert addresses to coordinates for map features and location-based searches.

## Requirements
1. Geocode addresses when properties are scraped
2. Populate latitude and longitude fields
3. Handle geocoding failures gracefully
4. Cache geocoding results to avoid duplicate API calls
5. Support batch geocoding for efficiency

## Technical Details
- Database fields: `latitude`, `longitude` in `properties` table
- Currently these fields are set to `null` when scraping

## Implementation Options
1. **Google Geocoding API**
   - Most accurate
   - Requires API key
   - Has usage limits and costs
2. **OpenStreetMap Nominatim**
   - Free and open source
   - Rate limited (1 request per second)
   - Good for Cape Town area
3. **Mapbox Geocoding API**
   - Good accuracy
   - Free tier available
   - Requires API key

## Recommended Approach
Use OpenStreetMap Nominatim for free tier, with fallback to Google if needed.

## Implementation Steps
1. Create geocoding service utility
2. Add geocoding call in scraping process (after property is scraped)
3. Cache results in database or Redis
4. Handle rate limiting
5. Add retry logic for failed geocoding

## Code Location
- Create: `src/lib/services/geocoding.ts`
- Integrate in: `src/app/api/listings/route.ts` (triggerScraping function)
- Also integrate in: `supabase/functions/scrape-properties/index.ts`

## Error Handling
- If geocoding fails, leave latitude/longitude as null
- Log failures for monitoring
- Don't block property saving if geocoding fails

## Testing
- Test with various Cape Town addresses
- Test with incomplete addresses
- Test rate limiting
- Test error handling

## Dependencies
- Geocoding API service (Google, OSM, or Mapbox)
- API keys for chosen service

