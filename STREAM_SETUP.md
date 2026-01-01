# Stream Dashboard Configuration - Quick Setup

## 1. Configure Call Type for Recording

### Step-by-step:
1. Go to https://dashboard.getstream.io
2. Select your app/project
3. Navigate to **Dashboard** → **Video** (left sidebar)
4. Click **Settings** → **Call Types**

### Configure "default" Call Type:
```
Call Type Name: default
```

#### Recording Settings:
- **Recording Mode**: Set to "on-demand" or "always-on"
  - "on-demand" = Host can start/stop recording manually
  - "always-on" = All calls are automatically recorded

#### Other Recommended Settings:
- **Max Duration**: 6 hours (or as needed)
- **Max Participants**: Set to match your needs (10-100+)
- **Geofencing**: Leave as default
- **Broadcasting**: Enable if needed
- **Screen Sharing**: Enable for co-interview use case
- **Audio Codec**: opus
- **Video Codec**: vp9

#### Enable Features:
- ☑ Transcription (if desired)
- ☑ Analytics
- ☑ Webhooks (for custom integrations)

---

## 2. Enable Webhooks (Optional but Recommended)

Go to **Developer** → **Webhooks**

Add webhook event for monitoring:
```
Event: call.ended
Webhook URL: https://your-backend.com/api/webhooks/call-ended
```

This allows you to trigger custom actions when calls end.

---

## 3. Verify Your Configuration

After setup, verify:
```
✅ API Key matches frontend: farcwq3kynth
✅ API Secret matches backend: (hidden for security)
✅ Call type "default" exists
✅ Recording enabled on "default" call type
✅ No IP restrictions blocking your app
```

---

## 4. Test the Integration

### Test 1: Create a Session
1. Go to your app
2. Create a new session
3. Should see in backend logs:
   ```
   ✅ Stream call created successfully: session_...
   ✅ Chat channel created successfully: session_...
   ```

### Test 2: Check Stream Dashboard
1. Go to https://dashboard.getstream.io
2. Navigate to **Video** → **Calls** (Live view)
3. While active call is running, it should appear here

### Test 3: Verify Recording
1. While in call, go to Stream dashboard
2. Click on your active call
3. You should see "Recording: ON" or "Recording: AVAILABLE"

---

## 5. Troubleshoot Common Issues

### Issue: "default" call type doesn't exist
**Solution**: Create it manually in dashboard → Call Types → Create New

### Issue: Call not appearing in Live Calls
**Solution**: 
- Check if call lasted at least 10 seconds
- Verify user is actually in the call
- Check browser console for errors
- Verify API credentials are correct

### Issue: Recording not starting
**Solution**:
- Go to call type settings
- Ensure "Recording Mode" is not "disabled"
- Change to "on-demand" or "always-on"
- Recreate the session

### Issue: "Invalid API Key"
**Solution**:
- Get new API key from dashboard → Credentials
- Update both backend .env and frontend .env
- Restart both servers

---

## 6. Important: Stream API Credentials

Keep these secure:
- **API Key** (public): `farcwq3kynth`
- **API Secret** (private): `5wqtwmu4fbhywkhmfdb7ymgpayvnwdnc5dx9376gettmfscrexc27dauq646pqkh`

Never expose API Secret in frontend code.

---

## 7. Monitoring & Analytics

### View Call History:
Dashboard → **Video** → **Calls** → Choose time range

### View Active Calls:
Dashboard → **Video** → **Calls** → Filter: "Live"

### View Recordings:
Dashboard → **Video** → **Recordings** (available after call ends)

### Check Metrics:
Dashboard → **Analytics** → **Video**

---

## 8. Next Steps

After configuration:
1. ✅ Verify call type exists and is enabled
2. ✅ Create a test session
3. ✅ Join the session and stay for 30+ seconds
4. ✅ Check Stream dashboard - call should appear
5. ✅ End session and verify recording appears
6. ✅ Download recording from dashboard

For more help: https://getstream.io/video/docs/
