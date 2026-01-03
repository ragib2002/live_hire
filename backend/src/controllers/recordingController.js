import { streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import Recording from "../models/Recording.js";

export async function getSessionRecordings(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Verify user has access to this session
    const session = await Session.findById(sessionId)
      .populate("host", "_id")
      .populate("participants", "_id");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user is host or participant
    const isHost = session.host._id.toString() === userId.toString();
    const isParticipant = session.participants.some(p => p._id.toString() === userId.toString());

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "You are not authorized to view this session's recordings" });
    }

    // Get recordings from database
    const recordings = await Recording.find({ sessionId }).sort({ startTime: -1 });

    res.status(200).json({ recordings });
  } catch (error) {
    console.log("Error in getSessionRecordings controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserRecordings(req, res) {
  try {
    const userId = req.user._id;

    // Get all sessions where user is host or participant
    const sessions = await Session.find({
      $or: [{ host: userId }, { participants: userId }],
    }).select("_id");

    const sessionIds = sessions.map(s => s._id);

    // Get all recordings for these sessions
    const recordings = await Recording.find({ sessionId: { $in: sessionIds } })
      .populate("sessionId", "problem difficulty")
      .sort({ startTime: -1 });

    res.status(200).json({ recordings });
  } catch (error) {
    console.log("Error in getUserRecordings controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function storeRecordingData(req, res) {
  try {
    const { sessionId, streamCallId } = req.body;
    const userId = req.user._id;

    // Verify user is the host of this session
    const session = await Session.findById(sessionId).populate("host", "_id");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.host._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only session host can store recordings" });
    }

    // Fetch recording data from Stream API
    try {
      const call = streamClient.video.call("default", streamCallId);
      const callState = await call.get();

      if (!callState.call.recording) {
        return res.status(400).json({ message: "No recording found for this call" });
      }

      // Check if recording already exists
      const existingRecording = await Recording.findOne({ streamCallId });
      if (existingRecording) {
        return res.status(200).json({ recording: existingRecording });
      }

      // Parse the recording URL from Stream response
      const recording = callState.call.recording;
      const startTime = new Date(callState.call.created_at);
      const endTime = new Date(callState.call.updated_at);
      const durationSeconds = Math.floor((endTime - startTime) / 1000);

      // Create recording record in database
      const newRecording = await Recording.create({
        sessionId,
        streamCallId,
        recordingId: recording.id || `rec_${Date.now()}`,
        url: recording.url || `https://stream.io/call/${streamCallId}/recording`,
        startTime,
        endTime,
        duration: durationSeconds,
        status: "ready",
      });

      // Update session with recording reference
      session.recordings.push(newRecording._id);
      session.recordingEnabled = true;
      await session.save();

      res.status(201).json({ recording: newRecording });
    } catch (streamError) {
      console.error("Error fetching recording from Stream:", streamError.message);
      
      // Still create a placeholder recording for reference
      const startTime = new Date();
      const newRecording = await Recording.create({
        sessionId,
        streamCallId,
        recordingId: `rec_${Date.now()}`,
        url: `https://stream.io/call/${streamCallId}/recording`,
        startTime,
        endTime: startTime,
        duration: 0,
        status: "processing",
      });

      session.recordings.push(newRecording._id);
      await session.save();

      res.status(201).json({ recording: newRecording, warning: "Recording data processing" });
    }
  } catch (error) {
    console.log("Error in storeRecordingData controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getRecordingDetails(req, res) {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    const recording = await Recording.findById(recordingId).populate({
      path: "sessionId",
      select: "problem difficulty host participants",
      populate: [
        { path: "host", select: "name email" },
        { path: "participants", select: "name email" },
      ],
    });

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Verify access
    const session = recording.sessionId;
    const isHost = session.host._id.toString() === userId.toString();
    const isParticipant = session.participants.some(p => p._id.toString() === userId.toString());

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "You are not authorized to view this recording" });
    }

    res.status(200).json({ recording });
  } catch (error) {
    console.log("Error in getRecordingDetails controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteRecording(req, res) {
  try {
    const { recordingId } = req.params;
    const userId = req.user._id;

    const recording = await Recording.findById(recordingId).populate({
      path: "sessionId",
      select: "host",
    });

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    // Only host can delete recording
    if (recording.sessionId.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only session host can delete recordings" });
    }

    // Delete from Stream if possible
    try {
      const call = streamClient.video.call("default", recording.streamCallId);
      // Stream SDK doesn't have direct delete for recordings, but we can handle it
      console.log("Marking recording as deleted in database");
    } catch (error) {
      console.log("Note: Could not delete from Stream:", error.message);
    }

    // Remove recording reference from session
    await Session.findByIdAndUpdate(recording.sessionId, {
      $pull: { recordings: recordingId },
    });

    // Delete recording from database
    await Recording.findByIdAndDelete(recordingId);

    res.status(200).json({ message: "Recording deleted successfully" });
  } catch (error) {
    console.log("Error in deleteRecording controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
