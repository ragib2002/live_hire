import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import User from "../models/User.js";

export async function createSession(req, res) {
  try {
    const { problem, difficulty, participantIds = [] } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // create session in db with participants array
    const session = await Session.create({ 
      problem, 
      difficulty, 
      host: userId, 
      callId,
      participants: participantIds
    });

    try {
      // create stream video call with recording enabled
      const callResponse = await streamClient.video.call("default", callId).getOrCreate({
        data: {
          created_by_id: clerkId,
          custom: { problem, difficulty, sessionId: session._id.toString() },
          recording: {
            mode: "available", // enables recording option
          },
        },
      });
      
      console.log("✅ Stream call created successfully:", callId);
      console.log("Call response:", callResponse);
    } catch (streamError) {
      console.error("⚠️ Warning: Error creating Stream call:", streamError.message);
      console.error("Stream error details:", streamError);
      // Continue even if Stream call creation fails - the session is already saved
    }

    // chat messaging - add host to channel members
    try {
      const channel = chatClient.channel("messaging", callId, {
        name: `${problem} Session`,
        created_by_id: clerkId,
        members: [clerkId],
      });

      await channel.create();
      console.log("✅ Chat channel created successfully:", callId);
    } catch (chatError) {
      console.error("⚠️ Warning: Error creating chat channel:", chatError.message);
      // Continue even if chat creation fails
    }
    
    res.status(201).json({ session });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;
    
    // Get sessions where user is the host or is in the participants array
    const sessions = await Session.find({ 
      status: "active",
      $or: [
        { host: userId },
        { participants: userId }
      ]
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host or in participants array
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participants: userId }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participants", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Check if user is host or invited participant
    const isHost = session.host._id.toString() === userId.toString();
    const isParticipant = session.participants.some(p => p._id.toString() === userId.toString());

    if (!isHost && !isParticipant) {
      return res.status(403).json({ message: "You are not authorized to view this session" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      return res.status(400).json({ message: "Host cannot join their own session as participant" });
    }

    // Check if user is invited (is in the participants array)
    const isInvited = session.participants.some(p => p.toString() === userId.toString());
    if (!isInvited) {
      return res.status(403).json({ message: "You are not invited to this session" });
    }

    // Check if user already joined
    const alreadyJoined = session.participants.includes(userId);
    if (alreadyJoined) {
      return res.status(200).json({ session });
    }

    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Try to get recording data before deleting the call
    try {
      const call = streamClient.video.call("default", session.callId);
      
      // delete stream video call
      await call.delete({ hard: true });
      console.log("✅ Stream call deleted successfully");
    } catch (error) {
      console.log("⚠️ Warning: Error deleting call data:", error.message);
      // Continue with session deletion even if call retrieval fails
    }

    // delete stream chat channel
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
      console.log("✅ Chat channel deleted successfully");
    } catch (error) {
      console.log("⚠️ Warning: Error deleting channel:", error.message);
    }

    session.status = "completed";
    await session.save();

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUsers(req, res) {
  try {
    const userId = req.user._id;

    // Get all users except the current user
    const users = await User.find({ _id: { $ne: userId } })
      .select("_id name email profileImage clerkId")
      .sort({ name: 1 });

    res.status(200).json({ users });
  } catch (error) {
    console.log("Error in getUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}