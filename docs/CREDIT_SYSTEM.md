# Credit System Documentation

## Overview

The Interview Screener uses a **granular time-based credit system** where users pay only for the actual interview time they use. This ensures fairness and transparency.

### Key Principles

1. **Pay for What You Use**: Credits are deducted based on actual call duration, not the planned duration
2. **Credit Blocking**: Credits are reserved (blocked) when an interview starts, then deducted after completion
3. **Automatic Refunds**: Unused credits are automatically returned to the user's wallet
4. **Transparent Pricing**: Users know exactly how many credits they need before starting

---

## Credit Calculation

### Base Rate

```
10 credits = 1 minute
5 credits = 30 seconds
2.5 credits = 15 seconds
```

### Duration Examples

| Interview Duration | Credits Required |
|-------------------|-----------------|
| 3 minutes | 30 credits |
| 5 minutes | 50 credits |
| 8 minutes | 80 credits |
| 10 minutes | 100 credits |

### Rounding Logic

Actual call duration is rounded to the nearest **15-second increment** to avoid fractional credits:

- **2m 7s** → rounds to **2m 15s** → **22.5 credits**
- **2m 22s** → rounds to **2m 30s** → **25 credits**
- **5m 3s** → rounds to **5m 15s** → **52.5 credits**

**Maximum rounding overhead**: 7.5 seconds (or 1.25 credits)

---

## Credit Lifecycle

### 1. Interview Start (Credit Blocking)

When a user starts an interview:

```typescript
// Example: User wants 8-minute interview
const creditsNeeded = 80 // 8 × 10

// Check available credits
const available = user.credits - user.blocked_credits
if (available < creditsNeeded) {
  // Show error with suggestions
  return { error: 'Insufficient credits', suggested_durations: [3, 5] }
}

// Block credits (reserve them)
await blockCredits(userId, 80, interviewSessionId)
// Result: credits -= 80, blocked_credits += 80
```

**Database State After Blocking**:
```
credits: 100 → 20
blocked_credits: 0 → 80
available_credits: 100 → 20
```

### 2. Interview In Progress

While the interview is running:
- Blocked credits remain reserved
- User cannot use blocked credits for other interviews
- UI shows both available and blocked credits

### 3. Interview End (Credit Deduction)

When the interview completes:

```typescript
// Example: User completed 2 minutes of an 8-minute interview
const blockedAmount = 80
const actualSeconds = 120 // 2 minutes
const actualCredits = calculateCreditsFromSeconds(120) // = 20
const refundAmount = blockedAmount - actualCredits // = 60

// Deduct actual usage and refund difference
await deductCredits(userId, blockedAmount, actualCredits, sessionId)
// Result: blocked_credits -= 80, credits += 60
```

**Database State After Deduction**:
```
credits: 20 → 80 (refunded 60)
blocked_credits: 80 → 0 (unblocked)
available_credits: 20 → 80
```

**Transaction Log**:
```
1. BLOCK: -80 credits (balance: 20)
2. DEDUCT: -20 credits (balance: 0)
3. REFUND: +60 credits (balance: 60)
Final balance: 80 credits
```

### 4. Failed Interview (Full Refund)

If the interview fails to start or is interrupted:

```typescript
// Restore all blocked credits
await refundBlockedCredits(userId, 80, sessionId)
// Result: blocked_credits -= 80, credits += 80
```

---

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  credits DECIMAL(10, 2) DEFAULT 50.0,        -- Available credits
  blocked_credits DECIMAL(10, 2) DEFAULT 0.0, -- Reserved credits
  interviews_remaining INTEGER DEFAULT 0,      -- Deprecated (for migration)
  
  -- Constraints
  CONSTRAINT credits_non_negative CHECK (credits >= 0),
  CONSTRAINT blocked_credits_non_negative CHECK (blocked_credits >= 0)
);
```

**Key Fields**:
- `credits`: Available credits the user can spend
- `blocked_credits`: Credits currently reserved for active interviews
- `interviews_remaining`: Legacy field (kept for backward compatibility)

### Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  transaction_type TEXT CHECK (transaction_type IN (
    'purchase',   -- Credits added via payment
    'block',      -- Credits reserved for interview
    'deduct',     -- Credits deducted after interview
    'refund',     -- Credits returned (unused portion)
    'adjustment'  -- Manual admin adjustment
  )),
  amount DECIMAL(10, 2),           -- Positive or negative
  balance_after DECIMAL(10, 2),    -- User's balance after transaction
  reference_id UUID,               -- Links to interview_session or payment
  reference_type TEXT,             -- 'interview' or 'payment'
  metadata JSONB,                  -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Purpose**: Complete audit trail of all credit movements

### Interview Sessions Table

```sql
ALTER TABLE interview_sessions
  ADD COLUMN credits_blocked DECIMAL(10, 2),      -- Credits reserved at start
  ADD COLUMN credits_deducted DECIMAL(10, 2),     -- Actual credits used
  ADD COLUMN credits_refunded DECIMAL(10, 2),     -- Credits returned
  ADD COLUMN actual_duration_seconds INTEGER;     -- Actual call duration
```

---

## API Endpoints

### 1. Create Call (Block Credits)

**Endpoint**: `POST /api/retell/create-call`

**Flow**:
1. Get user's profile (credits, blocked_credits, interview_duration)
2. Calculate credits needed for requested duration
3. Check if user has sufficient available credits
4. Block credits (reserve them)
5. Create Retell call
6. Store interview session with blocked credits
7. If call creation fails, refund blocked credits

**Request**:
```json
{
  "duration_minutes": 8
}
```

**Success Response**:
```json
{
  "access_token": "...",
  "call_id": "...",
  "credits_blocked": 80,
  "available_credits": 20
}
```

**Insufficient Credits Response** (403):
```json
{
  "error": "Insufficient credits",
  "available_credits": 30,
  "credits_needed": 80,
  "suggested_durations": [3],
  "max_duration": 3
}
```

### 2. Retell Webhook (Deduct Credits)

**Endpoint**: `POST /api/retell/webhook`

**Flow**:
1. Verify Retell webhook signature
2. Get interview session by call_id
3. Extract actual call duration from webhook data
4. Calculate actual credits used (with 15s rounding)
5. Deduct actual credits and refund difference
6. Update interview session with final credit amounts
7. Log all transactions

**Webhook Payload** (from Retell):
```json
{
  "event": "call_ended",
  "call": {
    "call_id": "...",
    "call_analysis": {
      "call_duration": 125,  // seconds
      "call_successful": true
    }
  }
}
```

**Processing**:
```typescript
const actualSeconds = 125
const roundedSeconds = Math.ceil(125 / 15) * 15 // = 135 (2m 15s)
const actualCredits = (135 / 60) * 10 // = 22.5 credits
const blockedCredits = 80
const refundAmount = 80 - 22.5 // = 57.5 credits
```

### 3. Payment Webhook (Add Credits)

**Endpoint**: `POST /api/razorpay/webhook`

**Flow**:
1. Verify Razorpay webhook signature
2. Get payment record and user_id
3. Calculate credits for purchased plan
4. Add credits to user's account
5. Log purchase transaction

**Credit Allocation**:
```typescript
// ₹149 plan = 2×8min interviews = 160 credits
const planCredits = 160

await supabase
  .from('profiles')
  .update({
    credits: profile.credits + planCredits,
    subscription_type: 'paid'
  })
  .eq('id', userId)
```

---

## Pricing Plans

### Free Tier

- **Credits**: 50 (one 5-minute interview)
- **Price**: Free
- **Interview Duration**: 5 minutes max
- **Allocation**: Automatic on signup

### Paid Tier (₹149)

- **Credits**: 160 (two 8-minute interviews)
- **Price**: ₹149
- **Interview Duration**: 8 minutes max
- **Equivalent**: 16 minutes of total interview time

### Credit Flexibility

Users can use their credits flexibly:

**Example 1**: User buys ₹149 plan (160 credits)
- Option A: Two 8-minute interviews (80 + 80)
- Option B: Five 3-minute interviews (30 × 5 = 150)
- Option C: Mix of different durations

**Example 2**: User has 30 credits remaining
- Can start a 3-minute interview (30 credits)
- Cannot start a 5-minute interview (needs 50 credits)
- System suggests: "Start a 3-minute interview instead"

---

## Credit Utilities

### Core Functions

**File**: `src/lib/credits.ts`

```typescript
// Calculate credits for duration
export function calculateCreditsForDuration(minutes: number): number {
  return minutes * 10
}

// Calculate credits from actual seconds (with rounding)
export function calculateCreditsFromSeconds(seconds: number): number {
  const roundedSeconds = Math.ceil(seconds / 15) * 15
  return (roundedSeconds / 60) * 10
}

// Get max duration for available credits
export function getMaxDurationForCredits(credits: number): number {
  return Math.floor(credits / 10)
}

// Suggest alternative durations
export function suggestDurations(availableCredits: number): number[] {
  const maxMinutes = getMaxDurationForCredits(availableCredits)
  const suggestions = [3, 5, 8, 10].filter(d => d <= maxMinutes)
  return suggestions.length > 0 ? suggestions : [maxMinutes]
}
```

### Transaction Functions

**File**: `src/lib/creditTransactions.ts`

```typescript
// Block credits for interview
export async function blockCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  interviewSessionId: string
): Promise<void>

// Deduct actual usage and refund difference
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  blockedAmount: number,
  actualAmount: number,
  interviewSessionId: string
): Promise<void>

// Refund all blocked credits (for failed calls)
export async function refundBlockedCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  interviewSessionId: string
): Promise<void>

// Log transaction
export async function logTransaction(
  supabase: SupabaseClient,
  data: TransactionData
): Promise<void>
```

---

## UI Components

### Dashboard Credit Display

```tsx
<div className="credit-card">
  <h3>Available Credits</h3>
  <p className="credit-amount">
    {profile.credits - profile.blocked_credits}
  </p>
  
  {profile.blocked_credits > 0 && (
    <p className="blocked-credits">
      ({profile.blocked_credits} blocked)
    </p>
  )}
  
  <p className="credit-info">
    = {getMaxDurationForCredits(profile.credits)} minutes
  </p>
</div>
```

### Pre-Interview Validation

```tsx
function validateCredits(selectedDuration: number) {
  const creditsNeeded = calculateCreditsForDuration(selectedDuration)
  const available = profile.credits - profile.blocked_credits
  
  if (available < creditsNeeded) {
    const suggestions = suggestDurations(available)
    
    return {
      error: true,
      message: `You need ${creditsNeeded} credits for a ${selectedDuration}-minute interview`,
      availableCredits: available,
      suggestedDurations: suggestions
    }
  }
  
  return { error: false }
}
```

### Interview Credit Indicator

```tsx
<div className="credit-usage">
  <p>Credits being used</p>
  <p className="usage-amount">
    {calculateCreditsFromSeconds(elapsedSeconds)} / {blockedCredits}
  </p>
  <p className="time-remaining">
    {formatTime(elapsedSeconds)} elapsed
  </p>
</div>
```

---

## Edge Cases & Error Handling

### 1. Insufficient Credits

**Scenario**: User tries to start 8-minute interview with only 30 credits

**Handling**:
```typescript
// API returns 403 with suggestions
{
  "error": "Insufficient credits",
  "available_credits": 30,
  "credits_needed": 80,
  "suggested_durations": [3],
  "max_duration": 3
}

// UI shows friendly message
"You have 30 credits (3 minutes). Would you like to:
- Start a 3-minute interview instead
- Purchase more credits (₹149 for 160 credits)"
```

### 2. Call Creation Failure

**Scenario**: Retell API fails after credits are blocked

**Handling**:
```typescript
try {
  await blockCredits(userId, 80, sessionId)
  const call = await retellClient.createCall(...)
} catch (error) {
  // Automatically refund blocked credits
  await refundBlockedCredits(userId, 80, sessionId)
  throw new Error('Failed to create call. Your credits have been restored.')
}
```

### 3. Concurrent Interviews

**Scenario**: User tries to start second interview while first is active

**Handling**:
```typescript
// Check available credits (excludes blocked)
const available = profile.credits - profile.blocked_credits

// If insufficient, show error
if (available < creditsNeeded) {
  return {
    error: "You have an active interview. Please complete it first or wait for credits to be released."
  }
}
```

### 4. Webhook Delivery Failure

**Scenario**: Retell webhook never arrives to deduct credits

**Handling**:
- Implement webhook retry mechanism
- Add manual reconciliation job (runs daily)
- Check for sessions older than 24 hours with status 'started'
- Automatically deduct maximum duration or refund based on Retell API query

```typescript
// Reconciliation job
async function reconcileStaleInterviews() {
  const stale = await getInterviewsOlderThan24Hours()
  
  for (const session of stale) {
    // Query Retell API for actual call data
    const callData = await retellClient.getCall(session.retell_call_id)
    
    if (callData.status === 'completed') {
      // Deduct actual usage
      await deductCredits(session.user_id, session.credits_blocked, actualCredits, session.id)
    } else {
      // Call failed, refund all
      await refundBlockedCredits(session.user_id, session.credits_blocked, session.id)
    }
  }
}
```

### 5. Network Interruption During Call

**Scenario**: User's network drops mid-interview

**Handling**:
- Retell tracks actual call duration until disconnection
- Webhook contains accurate duration
- Credits deducted only for actual time connected
- Unused credits automatically refunded

---

## Migration Guide

### Converting Existing Users

**Step 1**: Add new columns to profiles
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS credits DECIMAL(10, 2) DEFAULT 50.0,
  ADD COLUMN IF NOT EXISTS blocked_credits DECIMAL(10, 2) DEFAULT 0.0;
```

**Step 2**: Convert interviews_remaining to credits
```sql
UPDATE profiles
SET credits = CASE
  WHEN interview_duration = 8 THEN interviews_remaining * 80
  WHEN interview_duration = 5 THEN interviews_remaining * 50
  ELSE interviews_remaining * 50
END
WHERE interviews_remaining > 0;
```

**Step 3**: Verify conversion
```sql
SELECT 
  id,
  interviews_remaining,
  interview_duration,
  credits,
  (interviews_remaining * CASE WHEN interview_duration = 8 THEN 80 ELSE 50 END) as expected_credits
FROM profiles
WHERE interviews_remaining > 0;
```

**Step 4**: Update application code (deploy new version)

**Step 5**: Monitor for issues
```sql
-- Check for negative credits
SELECT * FROM profiles WHERE credits < 0;

-- Check for orphaned blocked credits
SELECT * FROM profiles WHERE blocked_credits > 0;
```

---

## Testing Checklist

### Unit Tests

- [ ] `calculateCreditsForDuration()` returns correct values
- [ ] `calculateCreditsFromSeconds()` rounds correctly to 15s
- [ ] `getMaxDurationForCredits()` calculates max duration
- [ ] `suggestDurations()` returns valid suggestions

### Integration Tests

- [ ] Block credits successfully
- [ ] Deduct credits and refund difference
- [ ] Refund all credits on failure
- [ ] Log all transactions correctly
- [ ] Handle concurrent credit operations

### End-to-End Tests

- [ ] New user signup → receives 50 credits
- [ ] Start 5-min interview → 50 credits blocked
- [ ] Complete 2-min interview → 20 deducted, 30 refunded
- [ ] Purchase ₹149 plan → 160 credits added
- [ ] Insufficient credits → see suggestions
- [ ] Failed call → credits restored

### Edge Case Tests

- [ ] Start interview with exact credits needed
- [ ] Start interview with 1 credit less than needed
- [ ] Concurrent interviews from same user
- [ ] Webhook arrives twice (idempotency)
- [ ] Call duration exceeds blocked amount
- [ ] Network interruption during call

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Credit Usage Patterns**
   - Average credits used per interview
   - Most common interview durations
   - Refund rate (unused credits)

2. **Financial Metrics**
   - Total credits purchased
   - Total credits consumed
   - Average revenue per credit

3. **User Behavior**
   - Percentage of users who run out of credits
   - Conversion rate (free → paid)
   - Credit purchase frequency

### Database Queries

```sql
-- Average credits used per interview
SELECT AVG(credits_deducted) as avg_credits_used
FROM interview_sessions
WHERE status = 'completed';

-- Total refunds in last 30 days
SELECT SUM(credits_refunded) as total_refunds
FROM interview_sessions
WHERE created_at > NOW() - INTERVAL '30 days';

-- Users with low credits (< 30)
SELECT id, name, credits, blocked_credits
FROM profiles
WHERE (credits - blocked_credits) < 30
ORDER BY credits ASC;
```

---

## Troubleshooting

### Issue: Credits Not Deducted After Interview

**Symptoms**: Interview completed but credits still blocked

**Diagnosis**:
```sql
-- Check interview session status
SELECT * FROM interview_sessions 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC LIMIT 5;

-- Check credit transactions
SELECT * FROM credit_transactions
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC LIMIT 10;
```

**Solution**:
1. Check if Retell webhook was received (check logs)
2. Manually trigger credit deduction using Retell API data
3. If call failed, refund blocked credits

### Issue: User Has Negative Credits

**Symptoms**: `credits` field is negative

**Diagnosis**:
```sql
SELECT * FROM profiles WHERE credits < 0;
```

**Solution**:
```sql
-- Investigate transaction history
SELECT * FROM credit_transactions 
WHERE user_id = 'USER_ID' 
ORDER BY created_at;

-- If legitimate, adjust credits
UPDATE profiles 
SET credits = 0 
WHERE id = 'USER_ID';

-- Log adjustment
INSERT INTO credit_transactions (user_id, transaction_type, amount, balance_after)
VALUES ('USER_ID', 'adjustment', ABS(credits), 0);
```

### Issue: Blocked Credits Not Released

**Symptoms**: `blocked_credits` > 0 but no active interview

**Diagnosis**:
```sql
-- Find profiles with blocked credits
SELECT p.id, p.blocked_credits, COUNT(i.id) as active_interviews
FROM profiles p
LEFT JOIN interview_sessions i ON p.id = i.user_id AND i.status = 'started'
WHERE p.blocked_credits > 0
GROUP BY p.id, p.blocked_credits;
```

**Solution**:
```sql
-- Release blocked credits for completed/failed interviews
UPDATE profiles
SET blocked_credits = 0,
    credits = credits + blocked_credits
WHERE id = 'USER_ID';

-- Log refund transaction
INSERT INTO credit_transactions (user_id, transaction_type, amount)
VALUES ('USER_ID', 'refund', blocked_credits);
```

---

## Security Considerations

### 1. Race Conditions

**Problem**: Two concurrent requests try to use the same credits

**Solution**: Use database transactions with row-level locking

```typescript
await supabase.rpc('block_credits_atomic', {
  p_user_id: userId,
  p_amount: creditsNeeded
})
```

```sql
CREATE OR REPLACE FUNCTION block_credits_atomic(
  p_user_id UUID,
  p_amount DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Lock the row
  PERFORM * FROM profiles WHERE id = p_user_id FOR UPDATE;
  
  -- Check and update atomically
  UPDATE profiles
  SET credits = credits - p_amount,
      blocked_credits = blocked_credits + p_amount
  WHERE id = p_user_id 
    AND (credits - blocked_credits) >= p_amount;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

### 2. Webhook Replay Attacks

**Problem**: Malicious actor replays webhook to add credits multiple times

**Solution**: 
- Verify webhook signature
- Check payment status before processing
- Use idempotency keys

```typescript
// Check if already processed
const { data: payment } = await supabase
  .from('payments')
  .select('status')
  .eq('razorpay_payment_id', paymentId)
  .single()

if (payment.status === 'paid') {
  return { success: true, message: 'Already processed' }
}
```

### 3. Credit Manipulation

**Problem**: User tries to modify credits directly

**Solution**:
- Use Row Level Security (RLS) policies
- Only allow service role to update credits
- All credit changes go through API endpoints

```sql
-- Users can only view their credits, not update
CREATE POLICY "Users can view own credits"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Only service role can update credits
CREATE POLICY "Service role can update credits"
  ON profiles FOR UPDATE
  USING (auth.role() = 'service_role');
```

---

## Future Enhancements

### 1. Credit Packages

Add more flexible pricing tiers:
- **₹99**: 100 credits (10 minutes)
- **₹149**: 160 credits (16 minutes) - Current
- **₹299**: 400 credits (40 minutes) - 33% bonus
- **₹499**: 750 credits (75 minutes) - 50% bonus

### 2. Credit Expiry

Implement credit expiration:
- Free credits: Expire after 30 days
- Paid credits: Expire after 90 days
- Send reminder emails before expiry

### 3. Credit Gifting

Allow users to gift credits:
- Generate gift codes
- Redeem codes for credits
- Track referrals

### 4. Subscription Plans

Monthly subscriptions with credit allowances:
- **₹299/month**: 300 credits + 50 bonus credits
- **₹499/month**: 600 credits + 100 bonus credits
- Unused credits roll over (up to 2x monthly allowance)

### 5. Credit Marketplace

Allow users to:
- Purchase credits in custom amounts
- Sell unused credits (with platform fee)
- Transfer credits between accounts

---

## Support & Maintenance

### Regular Tasks

**Daily**:
- Monitor webhook delivery success rate
- Check for stale blocked credits
- Review error logs for credit-related issues

**Weekly**:
- Analyze credit usage patterns
- Review refund rates
- Check for anomalies in credit transactions

**Monthly**:
- Reconcile credit balances with payment records
- Generate financial reports
- Review and optimize credit pricing

### Contact

For credit system issues or questions:
- **Technical Issues**: Check logs in Supabase Dashboard
- **User Support**: Review transaction history in `credit_transactions` table
- **Financial Queries**: Export payment and credit data for analysis
