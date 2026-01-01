# TASK-013: Add Message Templates (Premium Feature)

## Priority
P2 (Medium)

## Status
🔴 Not Started

## Description
Premium users should be able to create and use message templates to quickly send inquiries to property owners.

## Requirements
1. Create message_templates table
2. Allow users to create, edit, delete templates
3. Show templates in message form
4. Allow selecting template to pre-fill message
5. Gate behind premium status
6. Unlimited templates for premium users

## Technical Details
- Premium feature only
- Store templates per user
- Template should include subject and body
- Allow variables (e.g., {property_title}, {price})

## Database Schema
```sql
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Steps
1. Create database migration
2. Create API endpoints:
   - GET /api/message-templates
   - POST /api/message-templates
   - PUT /api/message-templates/[id]
   - DELETE /api/message-templates/[id]
3. Add template selector to message form
4. Add template management page
5. Add premium check

## Code Locations
- Create: `supabase/migrations/XXXXX_create_message_templates_table.sql`
- Create: `src/app/api/message-templates/route.ts`
- Create: `src/app/api/message-templates/[id]/route.ts`
- Update: Message form component
- Create: `src/app/message-templates/page.tsx`

## Template Variables
Support variables in templates:
- `{property_title}`: Property title
- `{price}`: Property price
- `{location}`: Property location
- `{bedrooms}`: Number of bedrooms
- `{bathrooms}`: Number of bathrooms

## Example Template
```
Subject: Inquiry about {property_title}

Hi,

I'm interested in your property at {location} listed for R{price}.

I would like to schedule a viewing if possible.

Thank you,
[Your Name]
```

## Testing
- Test creating template
- Test using template
- Test template variables replacement
- Test premium gating
- Test template management

## Dependencies
- Premium status (TASK-016)
- Message sending (TASK-010, TASK-011)

