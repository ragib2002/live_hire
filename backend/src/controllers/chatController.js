import { chatClient, streamClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // use clerkId for Stream (not mongodb _id)=> it should match the id we have in the stream dashboard
    const token = chatClient.createToken(req.user.clerkId);

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      userImage: req.user.image,
    });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getVideoToken(req, res) {
  try {
    // Generate token for video calls
    const userId = req.user.clerkId;
    const token = streamClient.generateUserToken(userId);

    console.log("✅ Video token generated for user:", userId);

    res.status(200).json({
      token,
      userId,
      userName: req.user.name,
      userImage: req.user.profileImage || req.user.image,
    });
  } catch (error) {
    console.error("Error in getVideoToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}