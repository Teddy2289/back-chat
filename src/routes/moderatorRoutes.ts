// routes/moderatorRoutes.ts
import express from "express";
import { authenticateToken } from "../middleware/auth";
import { ModeratorController } from "../controllers/moderatorController";

const router = express.Router();

// GET /api/moderators/:moderatorId/conversations
router.get(
  "/:moderatorId/conversations",
  authenticateToken,
  ModeratorController.getModeratorConversations
);

// GET /api/moderators/:moderatorId/messages
router.get(
  "/:moderatorId/messages",
  authenticateToken,
  ModeratorController.getModeratorMessages
);

// PATCH /api/moderators/conversations/:conversationId/status
router.patch(
  "/conversations/:conversationId/status",
  authenticateToken,
  ModeratorController.updateConversationStatus
);

// GET /api/moderators/:moderatorId/stats
router.get(
  "/:moderatorId/stats",
  authenticateToken,
  ModeratorController.getModeratorStats
);

export default router;
