import express from "express";
import { getStreamToken, getVideoToken } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/video-token", protectRoute, getVideoToken);

export default router;