import express from "express";
import { ClientController } from "../controllers/ClientController";

const router = express.Router();

// Récupérer les clients d'un modèle
router.get("/models/:modelId/clients", ClientController.getModelClients);

// Récupérer les clients avec statistiques
router.get(
  "/models/:modelId/clients/stats",
  ClientController.getModelClientsWithStats
);

// Récupérer les messages d'une conversation
router.get(
  "/conversations/:conversationId/messages",
  ClientController.getConversationMessages
);

export default router;
