# TASK-014: Implement Stripe Payment Processing

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
The premium page shows donation tiers but there's no payment processing implemented. We need to integrate Stripe to handle donations and activate premium subscriptions.

## Requirements
1. Set up Stripe account and API keys
2. Create payment checkout flow
3. Handle payment success/failure
4. Process donations and activate premium subscriptions
5. Store payment records in database
6. Update premium subscription table
7. Support custom donation amounts

## Technical Details
- Page: `src/app/premium/page.tsx`
- Database: `premium_subscriptions` table
- Donation tiers: R50 (coffee), R100 (1 month), R250 (3 months), R500 (6 months)

## Implementation Steps
1. Install Stripe SDK: `npm install stripe @stripe/stripe-js`
2. Set up Stripe account and get API keys
3. Create Stripe checkout session API route
4. Create payment success callback page
5. Create webhook handler for payment events
6. Update premium subscription on successful payment
7. Add payment buttons to premium page

## Code Structure
```
src/app/api/
  payments/
    checkout/route.ts          # Create Stripe checkout session
    success/route.ts            # Handle successful payment
    webhook/route.ts           # Stripe webhook handler
```

## Stripe Checkout Flow
1. User clicks "Donate" button
2. Frontend calls `/api/payments/checkout` with amount
3. API creates Stripe checkout session
4. User redirected to Stripe checkout
5. After payment, Stripe redirects to success page
6. Webhook updates premium subscription

## Database Updates
On successful payment:
- Insert/update record in `premium_subscriptions` table
- Set `expires_at` based on donation amount
- Set `status` to 'active'
- Store `stripe_payment_intent_id` for reference

## Environment Variables
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing
- Test with Stripe test cards
- Test different donation amounts
- Test payment success flow
- Test payment failure handling
- Test webhook processing
- Test premium activation

## Dependencies
- Stripe account
- Stripe npm packages
- Environment variables setup

## Security Considerations
- Never expose secret keys to frontend
- Verify webhook signatures
- Validate payment amounts server-side
- Handle payment disputes

