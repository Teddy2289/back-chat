import { Request, Response } from "express";
import { conversationService } from "../services/conversationService";

class ConversationController {
  // Créer une conversation
  async createConversation(req: Request, res: Response) {
    try {
      const { clientId, modelId } = req.body;

      if (!clientId || !modelId) {
        return res
          .status(400)
          .json({ error: "clientId and modelId are required" });
      }

      const conversation = await conversationService.createConversation({
        clientId: parseInt(clientId),
        modelId: parseInt(modelId),
      });

      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Vérifier l'accès à une conversation
  async checkAccess(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await conversationService.checkConversationAccess(
        parseInt(id)
      );

      if (!result.canChat) {
        return res.status(403).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Error checking conversation access:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Récupérer une conversation
  async getConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const conversation = await conversationService.getConversationById(
        parseInt(id)
      );

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Incrémenter le nombre de messages
  async incrementMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const updated = await conversationService.incrementMessageCount(
        parseInt(id)
      );

      res.json(updated);
    } catch (error) {
      console.error("Error incrementing message count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Incrémenter les crédits premium utilisés
  async incrementPremiumCredits(req: Request, res: Response) {
    try {
      const { paymentId } = req.body;

      if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
      }

      const updated = await conversationService.incrementPremiumCreditsUsed(
        parseInt(paymentId)
      );

      res.json(updated);
    } catch (error) {
      console.error("Error incrementing premium credits:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const conversationController = new ConversationController();
