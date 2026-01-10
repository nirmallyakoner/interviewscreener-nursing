# Retell Webhook Configuration Guide

## Overview

This guide will walk you through configuring the Retell webhook to send call analysis data to your application.

## Prerequisites

- Your application must be deployed and accessible via HTTPS
- You need access to your Retell dashboard
- Your webhook endpoint is: `/api/retell/webhook`

## Step-by-Step Instructions

### Step 1: Get Your Webhook URL

First, determine your webhook URL based on your deployment:

**Production:**
```
https://yourdomain.com/api/retell/webhook
```

**Development (using ngrok or similar):**
```
https://your-ngrok-url.ngrok.io/api/retell/webhook
```

> [!IMPORTANT]
> Retell requires HTTPS. For local development, use a tunneling service like:
> - [ngrok](https://ngrok.com/)
> - [localtunnel](https://localtunnel.github.io/www/)
> - [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

### Step 2: Access Retell Dashboard

1. Go to [Retell Dashboard](https://beta.retellai.com/)
2. Log in with your credentials
3. Navigate to your workspace

---

### Step 3: Configure Webhook

#### Option A: Agent-Level Webhook (Recommended)

1. **Navigate to Agents**
   - Click on "Agents" in the left sidebar
   - Select your nursing interview agent

2. **Open Agent Settings**
   - Click on the agent to open its details
   - Scroll down to find the "Webhook" or "Advanced Settings" section

3. **Add Webhook URL**
   - Look for "Webhook URL" field
   - Enter your webhook URL: `https://yourdomain.com/api/retell/webhook`
   - Save the configuration

4. **Select Events** (if available)
   - Enable these events:
     - ✅ `call_started`
     - ✅ `call_ended`
     - ✅ `call_analyzed`

#### Option B: Account-Level Webhook

1. **Navigate to Settings**
   - Click on "Settings" or "Account Settings" in the sidebar
   - Look for "Webhooks" or "Integrations" section

2. **Add New Webhook**
   - Click "Add Webhook" or "Create Webhook"
   - Enter webhook URL: `https://yourdomain.com/api/retell/webhook`

3. **Configure Events**
   - Select the following events:
     - ✅ `call_started` - When call begins
     - ✅ `call_ended` - When call completes
     - ✅ `call_analyzed` - When AI analysis is ready

4. **Save Configuration**
   - Click "Save" or "Create"
   - Copy the webhook secret (if provided) for verification

---

### Step 4: Test the Webhook

#### Using ngrok for Local Testing

1. **Install ngrok** (if not already installed)
   ```bash
   # Windows (using Chocolatey)
   choco install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your development server**
   ```bash
   npm run dev
   ```

3. **Start ngrok tunnel**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL**
   - ngrok will display a URL like: `https://abc123.ngrok.io`
   - Your webhook URL becomes: `https://abc123.ngrok.io/api/retell/webhook`

5. **Update Retell Dashboard**
   - Paste the ngrok webhook URL in Retell dashboard
   - Save the configuration

6. **Test the Integration**
   - Start an interview from your dashboard
   - Complete the interview
   - Check your terminal/console for webhook logs

---

### Step 5: Verify Webhook is Working

#### Check Application Logs

Your webhook endpoint logs events to the console. Look for:

```
Retell webhook received: call_started abc123-call-id
Retell webhook received: call_ended abc123-call-id
Retell webhook received: call_analyzed abc123-call-id
```

#### Check Database

After completing an interview, verify the data in Supabase:

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Open `interview_sessions` table
4. Find your recent session
5. Verify these fields are populated:
   - `status`: should be "completed"
   - `transcript`: should contain conversation text
   - `analysis`: should contain JSONB analysis data
   - `ended_at`: should have timestamp

#### Check UI

1. **Dashboard**: Should show "Latest Interview Analysis" section
2. **Profile**: Should show the interview in "Interview History"

---

## Webhook Payload Examples

### call_started Event

```json
{
  "event": "call_started",
  "call": {
    "call_id": "abc123-def456",
    "agent_id": "your-agent-id",
    "start_timestamp": 1704700800000
  }
}
```

### call_ended Event

```json
{
  "event": "call_ended",
  "call": {
    "call_id": "abc123-def456",
    "start_timestamp": 1704700800000,
    "end_timestamp": 1704701100000,
    "transcript": "Full conversation text here..."
  }
}
```

### call_analyzed Event

```json
{
  "event": "call_analyzed",
  "call": {
    "call_id": "abc123-def456",
    "analysis": {
      "overall_score": 85,
      "overall_feedback": "Great performance...",
      "strengths": ["Clear communication", "Good knowledge"],
      "improvements": ["Speak more confidently"],
      "recommendations": ["Practice more scenarios"],
      "communication_score": 90,
      "knowledge_score": 85,
      "confidence_score": 80
    }
  }
}
```

---

## Troubleshooting

### Webhook Not Receiving Events

1. **Check URL is correct**
   - Ensure HTTPS (not HTTP)
   - No trailing slash
   - Correct domain and path

2. **Verify webhook is saved in Retell**
   - Log into Retell dashboard
   - Check webhook configuration is active

3. **Check firewall/network**
   - Ensure your server accepts incoming requests
   - Check if port 443 is open

4. **Review server logs**
   - Check for any errors in your application logs
   - Look for webhook requests in access logs

### Analysis Not Appearing in UI

1. **Check database**
   - Verify `analysis` field has data
   - Ensure RLS policies allow reads

2. **Check component rendering**
   - Look for console errors in browser
   - Verify session status is "completed"

3. **Refresh the page**
   - Dashboard and profile fetch data on load
   - Hard refresh (Ctrl+Shift+R) to clear cache

### Database Permission Errors

If webhook can't update sessions:

```sql
-- Run this in Supabase SQL Editor
CREATE POLICY IF NOT EXISTS "Service role can update sessions"
  ON interview_sessions FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

---

## Security Considerations

### Webhook Signature Verification (Optional)

If Retell provides a webhook secret, you can verify requests:

```typescript
// In webhook/route.ts
import crypto from 'crypto'

function verifyWebhookSignature(body: any, signature: string): boolean {
  const secret = process.env.RETELL_WEBHOOK_SECRET!
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex')
  
  return hash === signature
}

// Then in POST handler:
const signature = request.headers.get('x-retell-signature')
if (!verifyWebhookSignature(body, signature)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
}
```

---

## Production Deployment

When deploying to production:

1. **Update webhook URL** in Retell dashboard to production domain
2. **Enable webhook signature verification** (if available)
3. **Monitor webhook logs** for errors
4. **Set up alerts** for webhook failures
5. **Test thoroughly** before going live

---

## Need Help?

- **Retell Documentation**: [https://docs.retellai.com/](https://docs.retellai.com/)
- **Retell Support**: Contact via dashboard
- **Application Issues**: Check your server logs and database
