# TASK-002: Implement Property24 Scraper HTML Parsing

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The Property24 scraper currently returns empty arrays. We need to implement actual HTML parsing to extract property listings from Property24's website.

## Requirements
1. Parse HTML from Property24 listing pages
2. Extract property data:
   - Title
   - Price
   - Location (suburb, city, address)
   - Property type
   - Bedrooms, bathrooms, parking
   - Images
   - Description
   - Agent contact information
   - External ID and source URL
3. Handle pagination
4. Implement error handling for failed requests
5. Respect rate limits (2 requests per second)

## Technical Details
- File: `src/lib/scrapers/property24-scraper.ts`
- Method: `scrapeListingPage()` and `scrapePropertyDetail()`
- Base URL: `https://www.property24.com/to-rent`
- URL format: `https://www.property24.com/to-rent/{city}/p{page}`

## Implementation Notes
- Property24 may use JavaScript rendering - may need headless browser
- Check for anti-scraping measures
- Handle different page layouts
- Extract data from both listing pages and detail pages

## Testing
- Test with Cape Town listings
- Verify all fields are extracted correctly
- Test pagination
- Test error handling

## Dependencies
- May need to add Cheerio or similar HTML parsing library
- May need Puppeteer/Playwright for JavaScript-rendered content

