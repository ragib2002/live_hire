# Call Recording Feature Implementation for Live Hire

## Overview
This document outlines the call recording feature implementation adapted from the Coding-Interview-Platform (Next.js/Convex) to the Live Hire project (MERN Stack).

## Architecture

### Key Differences in Approach
- **Coding-Interview-Platform**: Fetches recordings on-demand from Stream SDK using `call.queryRecordings()`
- **Live Hire**: Stores recording metadata in MongoDB for persistence and better access control

### Recording Flow
1. **Session Creation**: When a session is created, the Stream video call is created with `recording: { mode: "available" }`
2. **Recording During Call**: Stream SDK automatically handles recording when enabled by host
3. **Session End**: When session ends, call state is preserved (not deleted immediately) to allow recording retrieval
4. **Recording Storage**: Recording metadata is fetched from Stream API and stored in MongoDB
5. **Playback**: Users can view and play recordings through the Recordings page

## Backend Implementation

### 1. Database Models

#### Recording Model (`backend/src/models/Recording.js`)
```javascript
{
  sessionId: ObjectId (ref: Session),     // Reference to the session
  streamCallId: String,                    // Stream's call ID
  recordingId: String,                     // Stream's recording ID
  url: String,                             // Recording URL from Stream
  startTime: Date,                         // Recording start time
  endTime: Date,                           // Recording end time
  duration: Number,                        // Duration in seconds
  status: String,                          // "processing" | "ready" | "failed"
  createdAt: Date,
  updatedAt: Date
}
```

#### Session Model Updates
Added to existing Session model:
```javascript
{
  recordings: [ObjectId],          // Array of Recording references
  recordingEnabled: Boolean         // Flag if recording is enabled
}
```

### 2. API Endpoints

#### Recording Routes (`backend/src/routes/recordingRoutes.js`)

**GET `/api/recordings`**
- Fetches all recordings for the current user
- Returns recordings from all sessions where user is host or participant
- Populates session information (problem, difficulty)

**GET `/api/recordings/session/:sessionId`**
- Fetches recordings for a specific session
- Verifies user has access to the session

**POST `/api/recordings/store`**
- Stores recording metadata from Stream API into MongoDB
- Body: `{ sessionId, streamCallId }`
- Creates Recording document and updates Session with reference

**GET `/api/recordings/:recordingId`**
- Fetches detailed recording information
- Includes session details and participants
- Verifies access permissions

**DELETE `/api/recordings/:recordingId`**
- Deletes a recording from database
- Only session host can delete
- Removes reference from Session document

### 3. Recording Controller (`backend/src/controllers/recordingController.js`)

Key functions:
- `getSessionRecordings()`: Fetch recordings for a session with access control
- `getUserRecordings()`: Fetch all recordings for current user
- `storeRecordingData()`: Fetch from Stream and store in MongoDB
- `getRecordingDetails()`: Get detailed recording info with session data
- `deleteRecording()`: Delete recording and clean up references

**Recording Retrieval Logic**:
- Calls Stream API: `streamClient.video.call("default", streamCallId).get()`
- Extracts recording data from call state
- Creates MongoDB document with metadata
- Handles errors gracefully with status indicators

### 4. Session Controller Updates

Modified `createSession()`:
- Sets `recordingEnabled: true` when creating session
- Stream call configured with `recording: { mode: "available" }`

Modified `endSession()`:
- No longer deletes the call immediately
- Preserves call state to allow recording retrieval
- Records are fetched via API when needed

## Frontend Implementation

### 1. Components

#### RecordingCard Component (`frontend/src/components/RecordingCard.jsx`)
Displays individual recording with:
- Thumbnail with play button
- Recording date and duration
- Problem name and difficulty level
- Status badge (processing, ready, failed)
- Action buttons: Play, Copy Link, Delete

Features:
- Click thumbnail or Play button to open recording
- Copy link to clipboard
- Delete with confirmation
- Responsive grid layout

#### Recordings Page (`frontend/src/pages/RecordingsPage.jsx`)
- Lists all user recordings in a grid
- Shows loading state while fetching
- Displays error messages if any
- Empty state message when no recordings exist
- Responsive design (1, 2, or 3 columns based on screen size)

### 2. Custom Hooks

#### `useSessionRecordings(sessionId)`
```javascript
// Hook to fetch recordings for a specific session
const { recordings, isLoading, error } = useSessionRecordings(sessionId);
```

#### `useStoreRecording()`
```javascript
// Hook to store/fetch recording data from Stream
const { storeRecording, isStoring, error } = useStoreRecording();

// Usage:
const recording = await storeRecording(sessionId, streamCallId);
```

### 3. UI Integration

#### VideoCallUI Updates
- Added `useIsRecording` hook to detect recording status
- Shows "Recording" indicator badge when recording is active
- Red pulsing dot indicator for real-time feedback

#### RecentSessions Updates
- Added "Recording" link for completed sessions with recordings
- Links to recordings page filtered by session
- Video icon to indicate recording availability

#### Navbar Updates
- Added "Recordings" navigation link
- Accessible from all authenticated pages
- Consistent styling with other navigation items

#### App.jsx Routes
```javascript
<Route path="/recordings" element={<RecordingsPage />} />
<Route path="/recordings/:sessionId" element={<RecordingsPage />} />
```

## Data Flow

### Recording Creation Flow
```
Session Created
    ↓
Stream Call Created (recording: available)
    ↓
Call Participants Join
    ↓
Recording Enabled (by Stream)
    ↓
Session Ends
    ↓
Recording Preserved on Stream
    ↓
Host/Participant Accesses Recording
    ↓
API Fetches from Stream
    ↓
Data Stored in MongoDB
    ↓
User Views Recording
```

### Recording Retrieval Flow
```
User Visits Recordings Page
    ↓
Frontend Calls GET /api/recordings
    ↓
Backend Queries MongoDB for user's recordings
    ↓
Returns list with status and metadata
    ↓
Frontend Displays Recording Cards
    ↓
User Clicks Play
    ↓
Opens recording URL in new window
```

## Error Handling

### Stream API Errors
- If recording fetch fails, creates placeholder with "processing" status
- User can retry later when Stream data is available
- Graceful degradation - doesn't block session operations

### Database Errors
- Transaction-like behavior: updates Session only after Recording created
- Rollback logic for cleanup on failure
- Detailed error logs for debugging

### Access Control
- All endpoints verify user is host or participant
- Recording deletion only by session host
- Proper 403 Forbidden responses for unauthorized access

## Key Features Comparison

| Feature | Coding-Interview-Platform | Live Hire |
|---------|--------------------------|-----------|
| Recording Storage | On-Demand from Stream | MongoDB + Stream |
| Persistence | No (fetched each time) | Yes |
| Access Control | Basic (all users) | Granular (host/participant) |
| Metadata | Limited | Rich (duration, status, etc.) |
| Delete Support | No | Yes |
| Recording Status | Direct from Stream | Database tracked |
| Offline Access | No | Yes (metadata) |

## Setup Instructions

### 1. Backend Setup
1. Ensure Recording and Session models are in place
2. Register recording routes in `server.js`
3. Stream API keys should be in `.env` (already configured)
4. MongoDB connection ready

### 2. Frontend Setup
1. Components and hooks created
2. Routes registered in App.jsx
3. Navbar updated with recordings link
4. RecordingsPage accessible at `/recordings`

### 3. Testing Recording Feature
1. Create a new session
2. Join session and enable recording
3. End session
4. Wait for recording to process on Stream
5. Visit `/recordings` page
6. Should see recording card
7. Click play to view recording

## Environment Variables
No new environment variables needed. Uses existing Stream SDK configuration:
- `STREAM_API_KEY`
- `STREAM_API_SECRET`
- `STREAM_APP_ID` (if applicable)

## Security Considerations

1. **Access Control**: All endpoints verify user permissions
2. **Recording Ownership**: Only authorized users can access/delete
3. **Stream Integration**: Leverages Stream's security features
4. **Audit Trail**: MongoDB timestamps for all recording operations
5. **Data Validation**: Proper validation on request bodies

## Future Enhancements

1. **Recording Processing**: Queue system for large recording processing
2. **Transcription**: Add speech-to-text for recordings
3. **Comments**: Allow comments on specific parts of recordings
4. **Download**: Enable recording downloads for archival
5. **Analytics**: Track recording views and engagement
6. **Sharing**: Share recordings with external users
7. **Thumbnails**: Auto-generated thumbnails from recording
8. **Search**: Full-text search across recordings
9. **Retention Policy**: Auto-delete old recordings
10. **Streaming Quality**: Multiple quality options for playback

## Troubleshooting

### Recording Not Found
- Ensure session was recorded (check `recordingEnabled` flag)
- Wait for Stream to process recording (can take time)
- Check if user has access to the session

### "No Recording Found" Error
- Call may have been deleted before recording stored
- Check session status is "completed"
- Verify Stream video call still exists

### Recording URL Returns 404
- Recording still processing on Stream side
- Check recording status field
- Wait and retry later

## Code Organization

```
backend/
  ├── models/
  │   ├── Recording.js (NEW)
  │   └── Session.js (UPDATED)
  ├── controllers/
  │   ├── recordingController.js (NEW)
  │   └── sessionController.js (UPDATED)
  ├── routes/
  │   └── recordingRoutes.js (NEW)
  └── server.js (UPDATED)

frontend/
  ├── components/
  │   ├── RecordingCard.jsx (NEW)
  │   ├── RecentSessions.jsx (UPDATED)
  │   ├── VideoCallUI.jsx (UPDATED)
  │   └── Navbar.jsx (UPDATED)
  ├── pages/
  │   └── RecordingsPage.jsx (NEW)
  ├── hooks/
  │   ├── useSessionRecordings.js (NEW)
  │   └── useStoreRecording.js (NEW)
  └── App.jsx (UPDATED)
```

## References

- Stream SDK Documentation: https://getstream.io/video/docs/
- MongoDB Schema Design: https://docs.mongodb.com/manual/data-modeling/
- React Best Practices: https://react.dev/

## Implementation Status

✅ Database Models Created
✅ API Endpoints Implemented
✅ Backend Controllers Complete
✅ Frontend Components Built
✅ Custom Hooks Created
✅ Navigation Integration Done
✅ Error Handling Added
✅ Access Control Implemented

## Notes

- Recording feature is fully integrated with existing authentication (Clerk)
- All operations are secure and require authentication
- Graceful error handling throughout
- Responsive design for all screen sizes
- Consistent with Live Hire's design system
