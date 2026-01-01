# TASK-015: Implement Premium Subscription Activation

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
After a successful payment, premium subscriptions need to be activated. This includes updating the database and providing premium features to users.

## Requirements
1. Check if user has active premium subscription
2. Activate premium after successful payment
3. Calculate expiration date based on donation amount
4. Create utility function to check premium status
5. Update premium status when subscription expires
6. Handle subscription renewal

## Technical Details
- Database: `premium_subscriptions` table
- Fields: `user_id`, `status`, `expires_at`, `stripe_payment_intent_id`
- Donation tiers and months:
  - R50: 0 months (coffee donation)
  - R100: 1 month
  - R250: 3 months
  - R500: 6 months

## Implementation Steps
1. Create utility function: `src/lib/services/premium.ts`
   - `isPremiumActive(userId)`: Check if user has active premium
   - `getPremiumExpiry(userId)`: Get expiration date
2. Update premium subscription after payment:
   - Insert/update record in `premium_subscriptions`
   - Set `expires_at` based on donation amount
   - Set `status` to 'active'
3. Create scheduled job to mark expired subscriptions
4. Add premium checks throughout app

## Code Location
- Create: `src/lib/services/premium.ts`
- Update: `src/app/api/payments/success/route.ts`
- Create: `supabase/functions/check-expired-premium/index.ts` (scheduled job)

## Premium Status Check Function
```typescript
export async function isPremiumActive(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('premium_subscriptions')
    .select('expires_at, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  if (!data) return false;
  
  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  
  return expiresAt > now;
}
```

## Expiration Logic
- R50 donation: No premium (just a thank you)
- R100: 1 month from payment date
- R250: 3 months from payment date
- R500: 6 months from payment date

## Testing
- Test premium activation after payment
- Test expiration date calculation
- Test premium status checks
- Test expired subscription handling
- Test multiple donations (should extend, not replace)

## Dependencies
- Payment processing (TASK-014)
- Database access

