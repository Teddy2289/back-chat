// routes/conversationRoutes.ts
import express from "express";
import { conversationController } from "../controllers/conversationController";

const router = express.Router();

// Créer une nouvelle conversation
router.post(
  "/",
  conversationController.createConversation.bind(conversationController)
);

// Vérifier l’accès à une conversation
router.get(
  "/:id/check-access",
  conversationController.checkAccess.bind(conversationController)
);

// Récupérer une conversation
router.get(
  "/:id",
  conversationController.getConversation.bind(conversationController)
);

// Incrémenter le nombre de messages
router.post(
  "/:id/increment-message",
  conversationController.incrementMessage.bind(conversationController)
);

// Incrémenter crédits premium
router.post(
  "/increment-premium-credits",
  conversationController.incrementPremiumCredits.bind(conversationController)
);

export default router;
