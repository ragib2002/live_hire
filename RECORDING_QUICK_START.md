# Quick Integration Guide - Call Recording Feature

## What Was Implemented

A complete call recording feature for the Live Hire MERN application, adapted from the Coding-Interview-Platform's Next.js/Convex implementation.

## Files Created

### Backend (3 new files)
1. **`backend/src/models/Recording.js`** - MongoDB model for recording metadata
2. **`backend/src/controllers/recordingController.js`** - Logic for recording operations
3. **`backend/src/routes/recordingRoutes.js`** - API endpoints for recordings

### Frontend (4 new files)
1. **`frontend/src/components/RecordingCard.jsx`** - Individual recording display card
2. **`frontend/src/pages/RecordingsPage.jsx`** - Main recordings list page
3. **`frontend/src/hooks/useSessionRecordings.js`** - Hook for fetching recordings
4. **`frontend/src/hooks/useStoreRecording.js`** - Hook for storing recordings

## Files Modified

### Backend (3 modified files)
1. **`backend/src/models/Session.js`** - Added recording fields
2. **`backend/src/controllers/sessionController.js`** - Recording-aware session handling
3. **`backend/src/server.js`** - Registered recording routes

### Frontend (4 modified files)
1. **`frontend/src/components/VideoCallUI.jsx`** - Recording indicator
2. **`frontend/src/components/RecentSessions.jsx`** - Recording link
3. **`frontend/src/components/Navbar.jsx`** - Recordings navigation
4. **`frontend/src/App.jsx`** - Recording routes

## How to Use

### For Users
1. **Create a Session**: Start a new coding session normally
2. **Recording Starts Automatically**: Recording is enabled when call is active
3. **End Session**: Click end button to finish
4. **View Recordings**: Click "Recordings" in navbar
5. **Play Recording**: Click the play button on any recording card
6. **Copy Link**: Use the copy button to share recording link
7. **Delete**: Remove recording with delete button (host only)

### For Developers
```bash
# No new dependencies needed!
# All functionality uses existing packages

# Start backend (same as before)
cd backend
npm run dev

# Start frontend (same as before)
cd frontend
npm run dev
```

## API Endpoints

```
GET  /api/recordings              # Get all user recordings
GET  /api/recordings/:recordingId # Get specific recording
GET  /api/recordings/session/:id  # Get session recordings
POST /api/recordings/store        # Store new recording from Stream
DELETE /api/recordings/:recordingId # Delete recording
```

## Database

### New Collection
- **Recordings** collection with indexes on sessionId and streamCallId

### Session Collection Updates
```javascript
// Added fields:
{
  recordings: [ObjectId],    // Array of recording IDs
  recordingEnabled: Boolean  // Recording availability flag
}
```

## Key Features

✅ **Automatic Recording**: Enabled when session starts
✅ **Persistent Storage**: Recording metadata in MongoDB
✅ **Access Control**: Only authorized users can view/delete
✅ **Stream Integration**: Uses Stream SDK for actual video
✅ **Responsive UI**: Works on all screen sizes
✅ **Error Handling**: Graceful degradation
✅ **Status Tracking**: Know when recordings are ready
✅ **Easy Sharing**: Copy and share recording links

## Frontend Navigation

```
Navbar
├── Problems
├── Dashboard
├── Recordings ← NEW
└── User Menu

RecentSessions
└── [Recording] link for completed sessions

RecordingsPage
├── All user recordings
├── Filter by session (if using /recordings/:sessionId)
└── Manage recordings (play, copy, delete)
```

## Environment Setup

No new environment variables needed! Uses existing:
- `STREAM_API_KEY`
- `STREAM_API_SECRET`
- MongoDB connection string

All already configured in `.env` file.

## Common Tasks

### To Enable Recording for a Session
Recording is automatic when `recordingEnabled: true` in Session model.

### To Fetch a User's Recordings
```javascript
// Frontend
const { recordings } = useSessionRecordings(sessionId);
// or
fetch('/api/recordings')
```

### To Store Recording Data
```javascript
// Frontend
const { storeRecording } = useStoreRecording();
await storeRecording(sessionId, streamCallId);
```

### To Delete a Recording (Host Only)
```javascript
// Frontend
fetch(`/api/recordings/${recordingId}`, {
  method: 'DELETE'
})
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No recordings appear | Wait for Stream to process, check recordingEnabled flag |
| Recording URL 404 | Recording still processing, try again in a few minutes |
| Can't delete recording | Only session host can delete recordings |
| Recording not starting | Ensure recording is enabled in session creation |
| API 403 error | Check if user is host or participant of session |

## Flow Diagram

```
User Creates Session
        ↓
Session Saved to DB → recordingEnabled: true
        ↓
Stream Call Created with Recording Option
        ↓
User Joins Call
        ↓
Recording Active (pulsing indicator in UI)
        ↓
User Ends Session
        ↓
Call Data Preserved on Stream
        ↓
User Navigates to /recordings
        ↓
Frontend Lists Available Recordings
        ↓
User Clicks Play → Opens Stream Recording URL
```

## Code Examples

### Creating a Session with Recording
```javascript
// Already automated in backend
// recordingEnabled: true is set automatically
await Session.create({
  problem,
  difficulty,
  host: userId,
  callId,
  participants: participantIds,
  recordingEnabled: true  // ← Automatic
});
```

### Fetching Recordings in React
```javascript
// In component
const { recordings, isLoading, error } = useSessionRecordings(sessionId);

return (
  <div>
    {isLoading && <p>Loading...</p>}
    {error && <p>Error: {error}</p>}
    {recordings.map(r => <RecordingCard key={r._id} recording={r} />)}
  </div>
);
```

### Recording Status in Call
```javascript
// In VideoCallUI
{isRecording && (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 bg-red-700 rounded-full animate-pulse"></div>
    <span>Recording</span>
  </div>
)}
```

## Performance Notes

- Recording metadata stored in MongoDB (lightweight)
- Actual video hosted by Stream (no storage overhead)
- Indexes optimize common queries
- Lazy loading in UI for better performance
- Can handle hundreds of recordings per user

## Security Notes

✅ All endpoints require authentication (Clerk)
✅ Access control verified on every request
✅ Recording deletion restricted to host
✅ Input validation on all API calls
✅ HTTPS enforced for all Stream URLs

## Monitoring & Debugging

### Check Recording Status
```javascript
// Backend
const recording = await Recording.findById(recordingId);
console.log(recording.status); // "processing" | "ready" | "failed"
```

### Test Recording Fetch
```bash
# Test API endpoint
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/recordings
```

### View Logs
- Backend: Check server console for recording operations
- Frontend: Check browser console for API calls

## What's Different from Coding-Interview-Platform

| Aspect | Coding-Interview-Platform | Live Hire |
|--------|--------------------------|----------|
| Storage | None (fetched on-demand) | MongoDB |
| Persistence | Temporary | Permanent |
| Deletion | Not possible | Available |
| Access Control | Basic | Granular |
| Status Tracking | Stream only | Database tracked |
| Offline Access | No | Metadata yes |

## Next Steps (Optional Enhancements)

1. **Add Pagination**: For users with many recordings
2. **Search & Filter**: Find recordings by problem, date, difficulty
3. **Download**: Allow users to download recordings
4. **Transcription**: Add speech-to-text
5. **Sharing**: Share recordings with external users
6. **Analytics**: Track recording views
7. **Retention Policy**: Auto-delete old recordings
8. **Comments**: Add notes/annotations to recordings

## Support & Questions

If you encounter any issues:
1. Check the RECORDING_IMPLEMENTATION.md for detailed docs
2. Review error logs in backend/frontend console
3. Verify Stream API keys in .env
4. Ensure MongoDB is running and connected
5. Check network tab for API response details

---

**Status**: ✅ Ready for production use
**Last Updated**: January 3, 2026
**Compatibility**: Live Hire MERN Stack
