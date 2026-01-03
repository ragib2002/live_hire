import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getSessionRecordings,
  getUserRecordings,
  storeRecordingData,
  getRecordingDetails,
  deleteRecording,
} from "../controllers/recordingController.js";

const router = express.Router();

// Get all recordings for current user
router.get("/", protectRoute, getUserRecordings);

// Get recordings for a specific session
router.get("/session/:sessionId", protectRoute, getSessionRecordings);

// Store recording data from Stream
router.post("/store", protectRoute, storeRecordingData);

// Get specific recording details
router.get("/:recordingId", protectRoute, getRecordingDetails);

// Delete a recording
router.delete("/:recordingId", protectRoute, deleteRecording);

export default router;
