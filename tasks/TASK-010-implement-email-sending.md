# TASK-010: Implement Email Sending for Messages

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
When users send messages to property owners/agents, the messages are saved to the database but not actually sent via email. We need to implement email sending functionality.

## Requirements
1. Send email when message is created
2. Use recipient_email from property or message
3. Include property details in email
4. Include sender's message content
5. Update message status to 'sent' after successful delivery
6. Update message status to 'failed' if delivery fails
7. Store sent_at timestamp

## Technical Details
- File: `src/app/api/messages/route.ts`
- Currently has TODO at line 87: "In production, trigger actual email/message sending here"
- Message status: 'pending' -> 'sent' -> 'delivered' or 'failed'

## Implementation Options
1. **Supabase Edge Function with Email Service**
   - Use Supabase Edge Function to send emails
   - Integrate with email service (SendGrid, Mailgun, etc.)
2. **Next.js API Route with Email Service**
   - Send email directly from API route
   - Use Resend, SendGrid, or similar
3. **Database Trigger**
   - Use Supabase database trigger to send email when message is inserted
   - Call Edge Function from trigger

## Recommended Approach
Use Resend (simple, good free tier) or SendGrid in a Supabase Edge Function triggered by database trigger.

## Implementation Steps
1. Choose email service provider
2. Set up API keys in environment variables
3. Create email template with:
   - Property title and link
   - Sender's message
   - Contact information
4. Implement email sending in message creation flow
5. Update message status after sending
6. Add error handling

## Code Location
- Update: `src/app/api/messages/route.ts` (POST method, after line 85)
- Or create: `supabase/functions/send-message-email/index.ts`

## Email Template Structure
```
Subject: Inquiry about [Property Title]

Hello [Recipient Name],

You have received an inquiry about your property listing:

Property: [Property Title]
Location: [Suburb, City]
Price: R[Price]

Message from [User]:
[Message Body]

Reply to: [User Email]

View property: [Link to property on PropertyApp]
```

## Testing
- Test email sending with valid email addresses
- Test error handling with invalid emails
- Verify email formatting
- Test message status updates
- Test with different property types

## Dependencies
- Email service provider (Resend, SendGrid, Mailgun, etc.)
- API keys for email service
- Environment variables setup

