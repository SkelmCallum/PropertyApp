# TASK-011: Implement WhatsApp Message Sending

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
When users send messages and the property only has a phone number (no email), messages should be sent via WhatsApp. Currently, messages are saved but not sent.

## Requirements
1. Detect when to use WhatsApp (no email, has phone number)
2. Send WhatsApp message via API
3. Format message with property details
4. Update message status after sending
5. Handle WhatsApp API errors

## Technical Details
- File: `src/app/api/messages/route.ts`
- Channel detection: Currently sets channel to 'whatsapp' if no email (line 65-66)
- Message status: 'pending' -> 'sent' -> 'delivered' or 'failed'

## Implementation Options
1. **Twilio WhatsApp API**
   - Official WhatsApp Business API
   - Requires business verification
   - Paid service
2. **WhatsApp Business API (Meta)**
   - Official API
   - Requires business verification
   - Complex setup
3. **WhatsApp Web API (Unofficial)**
   - Using libraries like whatsapp-web.js
   - Not officially supported
   - May violate Terms of Service
4. **Click-to-Chat Links**
   - Generate WhatsApp links: `https://wa.me/[phone]?text=[message]`
   - User clicks link to open WhatsApp
   - No API needed, but requires user action

## Recommended Approach
Start with Click-to-Chat links (simplest), then upgrade to Twilio if needed.

## Implementation Steps
1. Format phone number (remove spaces, ensure country code)
2. URL encode message text
3. Generate WhatsApp link: `https://wa.me/27XXXXXXXXX?text=...`
4. For API approach:
   - Set up Twilio account
   - Configure WhatsApp sender
   - Send message via Twilio API
   - Update message status

## Code Location
- Update: `src/app/api/messages/route.ts` (POST method)
- Or create: `supabase/functions/send-whatsapp-message/index.ts`

## Message Format
```
Hi! I'm interested in your property listing:

🏠 [Property Title]
📍 [Suburb, City]
💰 R[Price]

[User's Message]

Reply to this message to contact me.
```

## Phone Number Formatting
- Remove spaces, dashes, parentheses
- Ensure country code (27 for South Africa)
- Format: 27XXXXXXXXX (no leading + or 0)

## Testing
- Test with valid South African phone numbers
- Test phone number formatting
- Test message encoding
- Test WhatsApp link generation
- Test API sending (if using Twilio)

## Dependencies
- Twilio account (if using API)
- Or no dependencies if using click-to-chat links

## Legal Considerations
- Ensure compliance with WhatsApp Terms of Service
- Only send to users who have opted in
- Consider opt-in mechanism

