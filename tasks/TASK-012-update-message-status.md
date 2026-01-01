# TASK-012: Update Message Status After Delivery

## Priority
P0 (Critical)

## Status
🔴 Not Started

## Description
After successfully sending a message (email or WhatsApp), the message status should be updated from 'pending' to 'sent' or 'delivered', and the sent_at timestamp should be recorded.

## Requirements
1. Update message status after successful email send
2. Update message status after successful WhatsApp send
3. Set sent_at timestamp
4. Handle delivery confirmations (if available)
5. Update status to 'failed' on error

## Technical Details
- Database fields: `status`, `sent_at`
- Status values: 'pending', 'sent', 'delivered', 'failed'
- Update in message sending code

## Implementation Steps
1. After successful email send:
   - Update status to 'sent'
   - Set sent_at to current timestamp
2. If email service provides delivery confirmation:
   - Update status to 'delivered' when confirmed
3. On error:
   - Update status to 'failed'
   - Log error details

## Code Location
- Update: `src/app/api/messages/route.ts` (POST method)
- Or update: Email/WhatsApp sending functions

## Implementation
```typescript
// After successful send
const { error: updateError } = await supabase
  .from('messages')
  .update({
    status: 'sent',
    sent_at: new Date().toISOString()
  })
  .eq('id', message.id);

// If delivery confirmation available (webhook)
// Update to 'delivered' when email service confirms
```

## Email Service Integration
- Resend: Provides webhook for delivery status
- SendGrid: Provides webhook for delivery events
- Mailgun: Provides webhook for delivery events

## Webhook Handler
Create webhook endpoint to receive delivery confirmations:
```typescript
// src/app/api/messages/webhook/route.ts
export async function POST(request: NextRequest) {
  const event = await request.json();
  
  if (event.type === 'email.delivered') {
    await supabase
      .from('messages')
      .update({ status: 'delivered' })
      .eq('id', event.messageId);
  }
}
```

## Testing
- Test status update after email send
- Test status update after WhatsApp send
- Test failed status on error
- Test delivery confirmation webhook
- Verify sent_at timestamp

## Dependencies
- Email sending (TASK-010)
- WhatsApp sending (TASK-011)

