# ngrok Setup Guide for Local Webhook Testing

## Step 1: Install ngrok

### Option A: Download Directly (Recommended)

1. **Go to**: https://ngrok.com/download
2. **Download** the Windows version (ZIP file)
3. **Extract** the ZIP file to a folder (e.g., `C:\ngrok`)
4. **Add to PATH** (optional but recommended):
   - Right-click "This PC" → Properties → Advanced System Settings
   - Click "Environment Variables"
   - Under "System Variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\ngrok` (or wherever you extracted it)
   - Click OK on all dialogs
   - Restart your terminal

### Option B: Using Chocolatey (if you have it)

```powershell
choco install ngrok
```

### Option C: Using Scoop (if you have it)

```powershell
scoop install ngrok
```

---

## Step 2: Sign Up for ngrok (Free)

1. **Go to**: https://dashboard.ngrok.com/signup
2. **Sign up** for a free account
3. **Get your auth token** from: https://dashboard.ngrok.com/get-started/your-authtoken

---

## Step 3: Configure ngrok

After installing, configure your auth token:

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Replace `YOUR_AUTH_TOKEN_HERE` with the token from your ngrok dashboard.

---

## Step 4: Start Your Dev Server

In your project directory:

```powershell
npm run dev
```

Keep this terminal open!

---

## Step 5: Start ngrok Tunnel

**Open a NEW terminal** and run:

```powershell
ngrok http 3000
```

You should see output like:

```
ngrok                                                                    

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

---

## Step 6: Get Your Webhook URL

From the ngrok output above, copy the **HTTPS** forwarding URL:

```
https://abc123def456.ngrok.io
```

Your webhook URL is:

```
https://abc123def456.ngrok.io/api/retell/webhook
```

---

## Step 7: Configure Retell Dashboard

1. Go to **Retell Dashboard** → **Agents** → **Your Agent**
2. Find **Webhook URL** field
3. Paste: `https://abc123def456.ngrok.io/api/retell/webhook`
4. Enable events:
   - ✅ call_started
   - ✅ call_ended
   - ✅ call_analyzed
5. **Save**

---

## Step 8: Test the Webhook

1. **Start an interview** from your dashboard
2. **Complete the interview**
3. **Watch your terminal** for webhook logs:
   ```
   Retell webhook received: call_started abc123-call-id
   Retell webhook received: call_ended abc123-call-id
   Retell webhook received: call_analyzed abc123-call-id
   ```

4. **Check your dashboard** - you should see the analysis!

---

## ngrok Web Interface

ngrok provides a web interface to inspect requests:

- **URL**: http://127.0.0.1:4040
- **View**: All HTTP requests and responses
- **Debug**: See webhook payloads in real-time

---

## Troubleshooting

### "ngrok not found" error

- Make sure you extracted ngrok.exe
- Add the folder to your PATH
- Or run ngrok with full path: `C:\ngrok\ngrok.exe http 3000`

### Tunnel not working

- Make sure your dev server is running on port 3000
- Check if another ngrok instance is running
- Try restarting ngrok

### Webhook not receiving events

- Verify the URL in Retell dashboard is correct
- Check ngrok is still running
- Look at http://127.0.0.1:4040 to see if requests are coming in

---

## Important Notes

⚠️ **Free ngrok limitations:**
- URL changes every time you restart ngrok
- Limited to 40 connections/minute
- Session expires after 2 hours

💡 **Tips:**
- Keep ngrok running while testing
- Use the web interface (http://127.0.0.1:4040) to debug
- Update Retell webhook URL if you restart ngrok

---

## Next Steps After Testing

Once everything works locally:

1. Deploy to production (Vercel, Netlify, etc.)
2. Update Retell webhook to production URL
3. Remove ngrok configuration
