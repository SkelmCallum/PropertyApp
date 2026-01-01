# TASK-022: Implement Report Scam Functionality on Property Detail Page

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
The property detail page has a flag icon button that should allow users to report suspicious listings. We need to implement the report scam functionality.

## Requirements
1. Create report scam form/modal
2. Allow user to select reason:
   - Fake listing
   - Fake contact information
   - Suspicious price
   - Duplicate images
   - Other
3. Allow optional description
4. Submit report via API
5. Show success feedback
6. Update property scam score after report

## Technical Details
- File: `src/app/listings/[id]/page.tsx`
- Button at line 304: `<Button variant="ghost" size="sm"><Flag /></Button>`
- API: `POST /api/scam-reports`
- Required: `property_id`, `reason`
- Optional: `description`

## Implementation Steps
1. Create report scam modal component
2. Add form with:
   - Radio buttons for reason selection
   - Textarea for description (optional)
   - Submit button
3. Handle form submission:
   - Validate reason is selected
   - Call `/api/scam-reports` API
   - Show success message
   - Close modal
4. Handle errors (already reported, etc.)

## Code Location
- Update: `src/app/listings/[id]/page.tsx`
- Optionally create: `src/components/report-scam-form.tsx`

## Report Reasons
- `fake_listing`: The property doesn't exist
- `fake_contact`: Contact information is fake
- `suspicious_price`: Price is too good to be true
- `duplicate_images`: Images are used in other listings
- `other`: Other reason (requires description)

## Form Validation
- Reason is required
- Description required if reason is "other"
- Show error if user already reported this property

## User Flow
1. User clicks flag icon
2. Modal opens with report form
3. User selects reason
4. User optionally adds description
5. User clicks "Submit Report"
6. API call is made
7. Success message shown
8. Modal closes
9. Property scam score may update

## Testing
- Test submitting report with different reasons
- Test validation (missing reason)
- Test duplicate report handling
- Test with unauthenticated user
- Verify scam score updates after report

## Dependencies
- Scam reports API (already exists)
- User authentication

