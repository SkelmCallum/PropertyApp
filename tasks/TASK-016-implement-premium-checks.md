# TASK-016: Add Premium Status Checks Throughout the App

## Priority
P1 (High)

## Status
🔴 Not Started

## Description
Premium features need to be gated behind premium status checks. We need to add checks throughout the app to enforce premium-only features.

## Requirements
1. Create premium check utility/hook
2. Add checks to premium features:
   - Ad-free experience
   - Advanced search filters
   - Early access to new listings
   - Priority customer support
   - Saved search notifications
   - Detailed scam analysis reports
   - Unlimited message templates
   - Download listings offline
3. Show upgrade prompts for non-premium users
4. Hide/disable premium features for free users

## Premium Features to Gate
1. **Ad-free experience**: Remove ads (if any) for premium users
2. **Advanced search filters**: Additional filter options
3. **Early access**: Show new listings to premium users first
4. **Saved search notifications**: Only for premium
5. **Detailed scam reports**: Enhanced scam analysis
6. **Message templates**: Unlimited templates for premium
7. **Offline download**: Premium-only feature

## Implementation Steps
1. Create React hook: `src/lib/hooks/use-premium.ts`
   ```typescript
   export function usePremium() {
     const { user } = useUser();
     const [isPremium, setIsPremium] = useState(false);
     
     useEffect(() => {
       if (user) {
         checkPremiumStatus(user.id).then(setIsPremium);
       }
     }, [user]);
     
     return { isPremium, isLoading };
   }
   ```

2. Add premium checks in components:
   - Search filters component
   - Listings page
   - Messages page
   - Property detail page

3. Show upgrade prompts:
   - "Upgrade to Premium" button
   - Link to `/premium` page
   - Show feature comparison

## Code Locations
- Create: `src/lib/hooks/use-premium.ts`
- Update: `src/components/search-filters.tsx`
- Update: `src/app/listings/page.tsx`
- Update: `src/app/messages/page.tsx`
- Update: `src/app/listings/[id]/page.tsx`

## Example Usage
```typescript
const { isPremium } = usePremium();

{isPremium ? (
  <AdvancedFilters />
) : (
  <UpgradePrompt feature="Advanced Filters" />
)}
```

## Testing
- Test premium features are hidden for free users
- Test premium features are shown for premium users
- Test upgrade prompts appear correctly
- Test premium status updates in real-time

## Dependencies
- Premium service (TASK-015)
- User authentication

