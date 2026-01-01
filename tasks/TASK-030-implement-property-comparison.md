# TASK-030: Implement Property Comparison Feature

## Priority
P3 (Low)

## Status
🔴 Not Started

## Description
Allow users to compare multiple properties side-by-side. This is a nice-to-have feature for helping users make decisions.

## Requirements
1. Allow users to select properties to compare
2. Store selected properties in state or local storage
3. Create comparison view/page
4. Display properties side-by-side
5. Highlight differences
6. Allow removing properties from comparison

## Technical Details
- Can use local storage for comparison list
- Or store in database for logged-in users
- Comparison view should show key differences

## Implementation Steps
1. Add "Compare" button to property cards
2. Store comparison list (localStorage or state)
3. Create comparison page/component
4. Display properties in comparison view
5. Highlight differences (price, features, etc.)

## Code Locations
- Create: `src/app/compare/page.tsx`
- Create: `src/components/property-comparison.tsx`
- Update: `src/components/property-card.tsx` (add compare button)
- Create: `src/lib/hooks/use-property-comparison.ts`

## Comparison View
Display properties in table format:
- Property images
- Price
- Location
- Bedrooms/Bathrooms/Parking
- Features (furnished, pet-friendly)
- Scam score
- Contact info

## Testing
- Test adding properties to comparison
- Test removing properties
- Test comparison view display
- Test with 2, 3, 4+ properties
- Test localStorage persistence

## Dependencies
- None (can use localStorage)

