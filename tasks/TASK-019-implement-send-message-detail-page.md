# TASK-019: Implement "Send Message" Functionality on Property Detail Page

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
The property detail page has a "Send Message" button that doesn't do anything. We need to implement the message sending functionality.

## Requirements
1. Create message form/modal
2. Allow user to enter subject and message body
3. Pre-populate property information
4. Call messages API to send message
5. Show success/error feedback
6. Redirect to messages page or show confirmation

## Technical Details
- File: `src/app/listings/[id]/page.tsx`
- Button at line 278: `<Button className="w-full">Send Message</Button>`
- API: `POST /api/messages`
- Required fields: `property_id`, `subject`, `body`

## Implementation Steps
1. Create message form component or modal
2. Add state for form visibility
3. Create form with:
   - Subject field
   - Message body textarea
   - Property info (read-only)
   - Submit button
4. Handle form submission:
   - Call `/api/messages` with property_id, subject, body
   - Show loading state
   - Handle success/error
5. Update UI after successful send

## Code Location
- Update: `src/app/listings/[id]/page.tsx`
- Optionally create: `src/components/message-form.tsx`

## Form Fields
- Subject: Text input (e.g., "Inquiry about [Property Title]")
- Message: Textarea
- Property details: Display only (title, price, location)
- Recipient: Display only (agent name/email/phone)

## User Flow
1. User clicks "Send Message" button
2. Modal/form appears with property details
3. User fills in subject and message
4. User clicks "Send"
5. Message is sent via API
6. Success message shown
7. User redirected to messages page or form closes

## Testing
- Test message sending with valid data
- Test error handling
- Test form validation
- Test with authenticated and unauthenticated users
- Test redirect to login if not authenticated

## Dependencies
- Messages API (TASK-010, TASK-011)
- User authentication

