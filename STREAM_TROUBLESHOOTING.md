# Stream.io Video Calls - Troubleshooting Guide

## Issue: Video calls not appearing in getstream.io dashboard

I've made several improvements to your Stream setup. Here's what was done and what you should verify:

## ✅ Changes Made

### Backend Updates:
1. **Enhanced Call Creation** (createSession)
   - Added recording configuration: `mode: "available"`
   - Better error handling and logging
   - Chat channel creation now properly configured with name

2. **Improved EndSession**
   - Detailed logging of call state before deletion
   - Better recording data capture
   - Graceful error handling

3. **New Video Token Endpoint**
   - Added `/api/chat/video-token` endpoint
   - Generates proper video tokens for Stream

4. **Enhanced Stream Setup** (stream.js)
   - Proper client initialization
   - Better error logging

### Frontend Updates:
1. **Improved useStreamClient Hook**
   - Added detailed console logging for debugging
   - Better error reporting with error details
   - Proper token handling

---

## 🔍 Verification Checklist

### 1. **Check Stream Dashboard Configuration**
   - Go to https://dashboard.getstream.io
   - Navigate to **Dashboard → Video → Call Types**
   - Verify your `default` call type exists
   - **Enable Recording**: Under your call type settings, ensure recording is enabled
     - Recording Mode: Set to "available" or "on-demand"
     - Transcription: (Optional)
     - HLS Playback: (Optional)

### 2. **Verify API Keys**
Backend (.env):
```
STREAM_API_KEY=farcwq3kynth ✓
STREAM_API_SECRET=5wqtwmu4fbhywkhmfdb7ymgpayvnwdnc5dx9376gettmfscrexc27dauq646pqkh ✓
```

Frontend (.env):
```
VITE_STREAM_API_KEY=farcwq3kynth ✓
```

### 3. **Enable Server-Side Logging**
Check backend logs when creating/joining calls:
```
✅ Stream call created successfully: session_...
✅ Chat channel created successfully: session_...
🎥 Joining video call: session_...
✅ Successfully joined video call
💬 Connecting to chat...
✅ Chat connected successfully
✅ Chat channel watched successfully
```

### 4. **Monitor Frontend**
Open browser DevTools (F12) → Console tab and look for:
```
✅ Video token generated for user: user_123
🎥 Joining video call: session_...
✅ Successfully joined video call
💬 Connecting to chat...
✅ Chat connected successfully
```

---

## 🔧 Troubleshooting Steps

### Problem: "Call not appearing in Stream Dashboard"

**Step 1: Verify Call Type Configuration**
- Ensure `default` call type is configured in Stream dashboard
- If not, create it under Video → Settings

**Step 2: Check Token Generation**
```bash
# Test the video token endpoint
curl http://localhost:3000/api/chat/video-token \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Step 3: Monitor Call Creation**
1. Open browser DevTools
2. Go to Network tab
3. Create a session
4. Look for successful calls to:
   - `POST /api/sessions` → should return 201
   - Session should have a `callId`

**Step 4: Verify Call Join**
1. Navigate to session page
2. Check console for "🎥 Joining video call" message
3. Verify call successfully joins (no errors)

**Step 5: Check Stream Dashboard in Real-Time**
1. While a call is active, go to Stream dashboard
2. Navigate to **Video → Calls (Live)**
3. Your active call should appear there

### Problem: "Recording not captured"

1. Ensure recording is enabled in call type settings
2. Recording starts automatically when call begins
3. Recording stops when last participant leaves
4. Check `recordingUrl` in your session document

### Problem: "Token generation fails"

Check backend logs:
```
❌ Error in getVideoToken controller: [error message]
```

Common issues:
- User not authenticated (check Clerk)
- Stream credentials invalid
- Network connectivity issue

---

## 📊 Expected Flow

```
1. User creates session
   ↓
2. Backend generates callId
   ↓
3. Stream call created with "default" call type
   ↓
4. Chat channel created
   ↓
5. User joins session page
   ↓
6. Frontend requests video token
   ↓
7. Video client joins the call
   ↓
8. Call appears in Stream dashboard (Video → Calls → Live)
   ↓
9. Recording starts (if enabled)
   ↓
10. User ends session
    ↓
11. Recording stops
    ↓
12. Call moved to call history
```

---

## 🔌 API Endpoints Reference

### Get Chat Token (for messaging)
```
GET /api/chat/token
Response: { token, userId, userName, userImage }
```

### Get Video Token (for video calls)
```
GET /api/chat/video-token
Response: { token, userId, userName, userImage }
```

### Create Session
```
POST /api/sessions
Body: { problem, difficulty, participantIds }
Response: { session with callId }
```

### Get Session by ID
```
GET /api/sessions/:id
Response: { session details }
```

### End Session
```
POST /api/sessions/:id/end
Response: { session with recording data }
```

---

## 💡 Additional Notes

1. **Call Type**: Using "default" call type - ensure it's properly configured
2. **Recording**: Automatically captured if enabled in call type
3. **User IDs**: Using `clerkId` (consistent across all Stream operations)
4. **Timeout**: Calls remain visible for 24 hours in dashboard
5. **Limits**: Free Stream tier has call/storage limits

---

## 🚀 Next Steps

1. Verify all environment variables are set correctly
2. Check Stream dashboard → call type configuration
3. Create a new session and monitor console logs
4. Verify call appears in Stream dashboard within seconds
5. Check recording starts after 10-15 seconds
6. Test ending the session and capturing recording

If calls still don't appear:
- Check Stream account status (not suspended)
- Verify API key has not been reset
- Check network tab for 4xx/5xx errors
- Review Stream SDK documentation version compatibility
